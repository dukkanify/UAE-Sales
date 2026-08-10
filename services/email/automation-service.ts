/**
 * Advanced Email Automation (CR009)
 * Facade over branded templates + mailer for lifecycle journeys.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { findUserById, readAuthDb } from "@/services/auth/store";
import { EMAIL_AUTOMATION_CATALOG } from "@/services/email/automation-catalog";
import {
  appendAutomationLog,
  getAutomationStats,
  isEventEnabled,
  listAutomationLogs,
  listDisabledEvents,
  setEventEnabled,
} from "@/services/email/automation-store";
import { renderAutomationTemplate } from "@/services/email/automation-templates";
import { isEmailDeliveryConfigured, sendEmail } from "@/services/email/mailer";
import { listOutboundEmails } from "@/services/email/outbox";
import { getPlatformSettings } from "@/services/settings/settings-service";
import type {
  EmailAutomationDispatchInput,
  EmailAutomationDispatchResult,
  EmailAutomationEvent,
  EmailAutomationOverview,
} from "@/types/email-automation";
import { EMAIL_AUTOMATION_EVENTS } from "@/types/email-automation";

export class EmailAutomationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "EmailAutomationError";
    this.status = status;
  }
}

function displayName(userId: string | null | undefined): string {
  if (!userId) return "Aviator";
  const u = findUserById(userId);
  if (!u) return "Aviator";
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

function resolveRecipients(input: EmailAutomationDispatchInput): Array<{
  email: string;
  userId: string | null;
  name: string;
}> {
  const out: Array<{ email: string; userId: string | null; name: string }> = [];
  const seen = new Set<string>();

  const push = (email: string, userId: string | null, name: string) => {
    const key = email.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ email: email.trim(), userId, name });
  };

  if (input.to) {
    const list = Array.isArray(input.to) ? input.to : [input.to];
    for (const email of list) push(email, null, strData(input.data, "recipientName", "Aviator"));
  }

  for (const userId of input.userIds ?? []) {
    const u = findUserById(userId);
    if (!u?.email) continue;
    push(u.email, u.id, displayName(u.id));
  }

  return out;
}

function strData(
  data: Record<string, string | number | boolean | null | undefined>,
  key: string,
  fallback = "",
): string {
  const v = data[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function assertEvent(event: string): asserts event is EmailAutomationEvent {
  if (!(EMAIL_AUTOMATION_EVENTS as readonly string[]).includes(event)) {
    throw new EmailAutomationError(`Unknown email automation event: ${event}`);
  }
}

/** Primary entry — dispatch a typed lifecycle email. */
export async function dispatchEmailEvent(
  input: EmailAutomationDispatchInput,
): Promise<EmailAutomationDispatchResult> {
  assertEvent(input.event);

  const result: EmailAutomationDispatchResult = {
    event: input.event,
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    outboxIds: [],
    errors: [],
  };

  if (!isEventEnabled(input.event)) {
    result.skipped = 1;
    return result;
  }

  const settings = getPlatformSettings();
  if (
    !settings.notifications.emailNotifications &&
    !input.system &&
    input.event !== "admin_alert"
  ) {
    result.skipped = 1;
    result.errors.push("Email notifications disabled");
    return result;
  }

  if (
    (input.event === "admin_alert" ||
      input.event === "instructor_alert" ||
      input.event === "student_alert") &&
    !settings.notifications.systemAlerts &&
    !input.system
  ) {
    result.skipped = 1;
    result.errors.push("System alerts disabled");
    return result;
  }

  const recipients = resolveRecipients(input);
  if (!recipients.length) {
    result.skipped = 1;
    result.errors.push("No recipients");
    return result;
  }

  for (const recipient of recipients) {
    result.attempted += 1;
    const data = {
      ...input.data,
      recipientName: input.data.recipientName ?? recipient.name,
    };
    const template = renderAutomationTemplate(input.event, data, input.subject);
    const mail = await sendEmail({
      to: recipient.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      meta: {
        kind: "email_automation",
        event: input.event,
        userId: recipient.userId,
        system: Boolean(input.system || input.event === "admin_alert"),
        ...input.meta,
      },
    });

    appendAutomationLog({
      event: input.event,
      to: recipient.email,
      subject: template.subject,
      success: mail.success,
      mode: mail.mode,
      outboxId: mail.outboxId,
      error: mail.error ?? null,
      actorId: input.actorId ?? null,
      data: { ...data, userId: recipient.userId },
    });

    if (mail.success) {
      result.sent += 1;
      result.outboxIds.push(mail.outboxId);
    } else {
      result.failed += 1;
      if (mail.error) result.errors.push(mail.error);
    }
  }

  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.EMAIL_AUTOMATION_DISPATCHED,
    entityType: "email_automation",
    entityId: input.event,
    metadata: {
      event: input.event,
      attempted: result.attempted,
      sent: result.sent,
      failed: result.failed,
    },
  });

  return result;
}

/** Resolve admins / instructors / students for role alerts. */
export async function dispatchRoleAlert(input: {
  event: "admin_alert" | "instructor_alert" | "student_alert";
  title: string;
  detail: string;
  reference?: string;
  actorId?: string | null;
  /** Limit student/instructor alerts to specific users. */
  userIds?: string[];
  system?: boolean;
}) {
  let userIds = input.userIds ?? [];
  if (!userIds.length) {
    if (input.event === "admin_alert") {
      userIds = readAuthDb()
        .users.filter(
          (u) => (u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN) && u.status === "active",
        )
        .map((u) => u.id);
    } else if (input.event === "instructor_alert") {
      userIds = readAuthDb()
        .users.filter(
          (u) =>
            (u.role === ROLES.INSTRUCTOR || u.role === ROLES.CHIEF_GROUND_INSTRUCTOR) &&
            u.status === "active",
        )
        .map((u) => u.id);
    } else {
      userIds = readAuthDb()
        .users.filter((u) => u.role === ROLES.STUDENT && u.status === "active")
        .slice(0, 50)
        .map((u) => u.id);
    }
  }

  return dispatchEmailEvent({
    event: input.event,
    userIds,
    data: {
      title: input.title,
      detail: input.detail,
      reference: input.reference ?? "",
    },
    actorId: input.actorId,
    system: input.system ?? input.event === "admin_alert",
  });
}

export function getEmailAutomationOverview(): EmailAutomationOverview {
  const settings = getPlatformSettings();
  const disabled = new Set(listDisabledEvents());
  const catalog = EMAIL_AUTOMATION_CATALOG.map((c) => ({
    ...c,
    enabled: !disabled.has(c.event),
  }));
  const recent = listAutomationLogs(30);
  const outboxPreview = listOutboundEmails(20).map((m) => ({
    id: m.id,
    to: m.to,
    subject: m.subject,
    mode: m.mode,
    event: typeof m.meta?.event === "string" ? m.meta.event : null,
    createdAt: m.createdAt,
  }));

  return {
    catalog,
    recent,
    outboxPreview,
    smtpConfigured: isEmailDeliveryConfigured(),
    emailNotificationsEnabled: settings.notifications.emailNotifications,
    stats: getAutomationStats(),
  };
}

export function configureAutomationEvent(event: EmailAutomationEvent, enabled: boolean) {
  assertEvent(event);
  return setEventEnabled(event, enabled);
}

export { EMAIL_AUTOMATION_CATALOG };

/** Convenience helpers used by domain services. */
export async function emailRegistrationWelcome(input: { userId: string; actorId?: string | null }) {
  return dispatchEmailEvent({
    event: "registration",
    userIds: [input.userId],
    data: {
      detail: "Complete your profile and explore ATPL theory, live classes, and bookings.",
    },
    actorId: input.actorId ?? input.userId,
  });
}

export async function emailPaymentUpdate(input: {
  userId: string;
  title: string;
  detail: string;
  amountLabel?: string;
  reference?: string;
  actorId?: string | null;
}) {
  return dispatchEmailEvent({
    event: "payment",
    userIds: [input.userId],
    data: {
      title: input.title,
      detail: input.detail,
      amountLabel: input.amountLabel ?? "",
      reference: input.reference ?? "",
    },
    actorId: input.actorId,
  });
}

export async function emailScheduleLifecycle(input: {
  event: "schedule" | "reschedule" | "cancel";
  userIds: string[];
  title: string;
  when?: string;
  detail?: string;
  liveClassId?: string;
  actorId?: string | null;
}) {
  return dispatchEmailEvent({
    event: input.event,
    userIds: input.userIds,
    data: {
      title: input.title,
      when: input.when ?? "",
      detail: input.detail ?? "",
    },
    actorId: input.actorId,
    meta: { liveClassId: input.liveClassId },
  });
}

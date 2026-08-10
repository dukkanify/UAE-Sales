/**
 * Installment due-date reminder emails / in-app (CR003).
 */

import { generateId } from "@/lib/security/crypto";
import { findUserById } from "@/services/auth/store";
import { sendEmail } from "@/services/email/mailer";
import { createNotification } from "@/services/notifications/notification-service";
import { installmentReminderEmailTemplate } from "@/services/settings/email-templates";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { processOverdueInstallments } from "@/services/payments/installment-service";
import { formatMinor } from "@/services/payments/money";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type { InstallmentReminderLog } from "@/types/payments";

function nowIso() {
  return new Date().toISOString();
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function processInstallmentReminders(): Promise<{
  sent: number;
  overdue: { markedOverdue: number; suspended: number };
}> {
  const overdue = await processOverdueInstallments("system");
  const settings = readPaymentsDb().settings;
  const platform = getPlatformSettings();
  const offsets = settings.installmentReminderOffsetsDays ?? [7, 3, 1, 0];
  const today = startOfDay(Date.now());
  let sent = 0;

  const plans = readPaymentsDb().installmentPlans.filter(
    (p) => p.status === "active" || p.status === "overdue" || p.status === "suspended",
  );

  for (const plan of plans) {
    const items = readPaymentsDb().installmentSchedule.filter(
      (s) =>
        s.planId === plan.id &&
        (s.status === "due" || s.status === "upcoming" || s.status === "overdue"),
    );
    const student = findUserById(plan.studentId);
    if (!student) continue;

    for (const item of items) {
      const dueDay = startOfDay(Date.parse(item.dueAt));
      if (Number.isNaN(dueDay)) continue;
      const daysUntil = Math.round((dueDay - today) / 86_400_000);

      if (!offsets.includes(daysUntil) && !(daysUntil < 0 && offsets.includes(0))) {
        // Also send overdue daily when past due and 0 is in offsets
        if (!(daysUntil < 0 && item.status === "overdue")) continue;
      }

      const kind = daysUntil < 0 ? "overdue" : daysUntil === 0 ? "due_today" : "due_soon";
      const reminderKey = `${kind}:${daysUntil}`;
      if (item.reminderSentAt.includes(reminderKey)) continue;

      const amountLabel = formatMinor(item.amount, item.currency);
      const dueLabel = new Date(item.dueAt).toLocaleDateString();

      if (platform.notifications.inAppNotifications) {
        await createNotification({
          userId: plan.studentId,
          title:
            kind === "overdue"
              ? "Installment overdue"
              : kind === "due_today"
                ? "Installment due today"
                : "Upcoming installment",
          body: `${plan.productName}: ${amountLabel} due ${dueLabel}.`,
          type: `installment.${kind}`,
          data: { planId: plan.id, scheduleItemId: item.id },
        });
        logReminder({
          planId: plan.id,
          scheduleItemId: item.id,
          studentId: plan.studentId,
          channel: "in_app",
          kind,
        });
        sent += 1;
      }

      if (platform.notifications.reminderEmails && platform.notifications.emailNotifications) {
        try {
          const tpl = installmentReminderEmailTemplate({
            productName: plan.productName,
            amountLabel,
            dueLabel,
            kind,
            sequence: item.sequence,
            totalCount: plan.installmentCount,
          });
          await sendEmail({
            to: student.email,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          });
          logReminder({
            planId: plan.id,
            scheduleItemId: item.id,
            studentId: plan.studentId,
            channel: "email",
            kind,
          });
          sent += 1;
        } catch (error) {
          logReminder({
            planId: plan.id,
            scheduleItemId: item.id,
            studentId: plan.studentId,
            channel: "email",
            kind,
            status: "failed",
            error: error instanceof Error ? error.message : "send failed",
          });
        }
      }

      writePaymentsDb((db) => {
        const row = db.installmentSchedule.find((s) => s.id === item.id);
        if (!row) return;
        row.reminderSentAt = [...row.reminderSentAt, reminderKey];
        row.lastReminderAt = nowIso();
        row.updatedAt = nowIso();
      });
    }
  }

  return { sent, overdue };
}

function logReminder(input: {
  planId: string;
  scheduleItemId: string;
  studentId: string;
  channel: "email" | "in_app";
  kind: InstallmentReminderLog["kind"];
  status?: "sent" | "failed";
  error?: string | null;
}) {
  const row: InstallmentReminderLog = {
    id: generateId(),
    planId: input.planId,
    scheduleItemId: input.scheduleItemId,
    studentId: input.studentId,
    channel: input.channel,
    kind: input.kind,
    sentAt: nowIso(),
    status: input.status ?? "sent",
    error: input.error ?? null,
  };
  writePaymentsDb((db) => {
    db.installmentReminders.unshift(row);
  });
}

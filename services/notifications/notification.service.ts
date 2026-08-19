import { findUserById, getAllUsers } from "@/services/auth/user-store";
import { sendTransactionalEmail } from "@/services/email/transactional-email";
import type { EmailEventType } from "@/services/email/email-log-store";
import { getEmailLogs } from "@/services/email/email-log-store";
import {
  createNotification,
  findNotificationByIdempotencyKey,
  patchNotification,
} from "@/services/payments/notification-store";
import {
  shouldSendEmail,
  type PreferenceCategory,
} from "@/services/notifications/notification-preferences";
import type { AppLocale } from "@/shared/i18n/locale";
import type {
  AppNotification,
  EmailChannelStatus,
  NotificationType,
} from "@/types/domain/notification";

export type NotifyEmailContent = {
  bodyHtml: string;
  bodyLines: string[];
  ctaHref?: string;
  ctaLabel?: string;
  dedupeWindowMs?: number;
  entityId?: string;
  subject: string;
  title?: string;
  type?: EmailEventType;
};

export type NotifyInput = {
  body: string;
  bodyEn?: string;
  channels?: Array<"in_app" | "email">;
  critical?: boolean;
  email?: NotifyEmailContent;
  href?: string;
  idempotencyKey: string;
  locale?: AppLocale;
  orderId?: string;
  preference?: PreferenceCategory;
  recipientEmail?: string;
  title: string;
  titleEn?: string;
  type: NotificationType;
  userId: string;
};

export type NotifyResult = {
  emailStatus: EmailChannelStatus;
  inApp?: AppNotification;
  skipped: boolean;
};

const EMAIL_FAILURE_THRESHOLD = 8;
const EMAIL_FAILURE_WINDOW_MS = 30 * 60 * 1000;
let lastAdminEmailAlertAt = 0;

function wantsChannel(
  channels: NotifyInput["channels"],
  channel: "in_app" | "email",
): boolean {
  if (!channels || channels.length === 0) return true;
  return channels.includes(channel);
}

async function maybeAlertAdminsOfEmailFailures(): Promise<void> {
  const now = Date.now();
  if (now - lastAdminEmailAlertAt < EMAIL_FAILURE_WINDOW_MS) return;

  try {
    const logs = await getEmailLogs();
    const cutoff = now - EMAIL_FAILURE_WINDOW_MS;
    const failed = logs.filter(
      (item) =>
        item.status === "failed" && new Date(item.createdAt).getTime() >= cutoff,
    ).length;
    if (failed < EMAIL_FAILURE_THRESHOLD) return;

    lastAdminEmailAlertAt = now;
    const hourBucket = Math.floor(now / EMAIL_FAILURE_WINDOW_MS);
    const admins = (await getAllUsers()).filter((user) => user.role === "admin");
    await Promise.all(
      admins.map((admin) =>
        notify({
          userId: admin.id,
          type: "admin_ops",
          title: "تجاوز فشل إرسال البريد الحد المسموح",
          titleEn: "Email delivery failures crossed the alert threshold",
          body: `فشل إرسال ${failed} رسالة خلال 30 دقيقة. راجع مزود البريد (Resend).`,
          bodyEn: `${failed} emails failed in the last 30 minutes. Check Resend.`,
          href: "/admin/notifications",
          idempotencyKey: `ADMIN_EMAIL_FAILURE_THRESHOLD:${hourBucket}`,
          channels: ["in_app"],
        }),
      ),
    );
  } catch (error) {
    console.error("[Sooqna Notify] email failure alert skipped", error);
  }
}

/**
 * Single entry for business events: in-app + email.
 * Never throws — email failure cannot break listing, booking, payment, or orders.
 */
export async function notify(input: NotifyInput): Promise<NotifyResult> {
  try {
    const existing = await findNotificationByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return {
        skipped: true,
        inApp: existing,
        emailStatus: existing.emailStatus ?? "skipped",
      };
    }

    const user = input.userId ? await findUserById(input.userId) : null;
    const locale: AppLocale = input.locale ?? user?.locale ?? "ar";
    let inApp: AppNotification | undefined;
    let emailStatus: EmailChannelStatus = "not_requested";

    if (wantsChannel(input.channels, "in_app") && input.userId) {
      try {
        inApp = await createNotification({
          userId: input.userId,
          orderId: input.orderId,
          type: input.type,
          title: input.title,
          body: input.body,
          titleEn: input.titleEn,
          bodyEn: input.bodyEn,
          href: input.href,
          idempotencyKey: input.idempotencyKey,
          emailStatus: wantsChannel(input.channels, "email") ? "pending" : "not_requested",
        });
      } catch (error) {
        console.error("[Sooqna Notify] in-app failed", error);
      }
    }

    const sendEmail = wantsChannel(input.channels, "email") && Boolean(input.email);
    if (sendEmail && input.email) {
      const allowEmail = shouldSendEmail({
        category: input.preference,
        critical: input.critical,
        type: input.type,
        user,
      });
      const to = (input.recipientEmail ?? user?.email ?? "").trim().toLowerCase();
      if (!allowEmail || !to.includes("@")) {
        emailStatus = "skipped";
      } else {
        try {
          emailStatus = await sendTransactionalEmail({
            bodyHtml: input.email.bodyHtml,
            bodyLines: input.email.bodyLines,
            ctaHref: input.email.ctaHref,
            ctaLabel: input.email.ctaLabel,
            dedupeWindowMs: input.email.dedupeWindowMs,
            entityId: input.email.entityId ?? input.idempotencyKey,
            locale,
            subject: input.email.subject,
            title: input.email.title ?? (locale === "en" ? input.titleEn ?? input.title : input.title),
            to,
            type: input.email.type ?? (input.type as EmailEventType),
            userId: input.userId,
          });
        } catch (error) {
          console.error("[Sooqna Notify] email failed", error);
          emailStatus = "failed";
        }
      }

      if (inApp) {
        void patchNotification(inApp.id, { emailStatus }).catch(() => undefined);
      }
      if (emailStatus === "failed") {
        void maybeAlertAdminsOfEmailFailures();
      }
    }

    return { skipped: false, inApp, emailStatus };
  } catch (error) {
    console.error("[Sooqna Notify] notify() failed", error);
    return { skipped: false, emailStatus: "failed" };
  }
}

export async function notifyAdmins(
  input: Omit<NotifyInput, "userId"> & { userId?: string },
): Promise<void> {
  try {
    const admins = (await getAllUsers()).filter((user) => user.role === "admin");
    await Promise.all(
      admins.map((admin) =>
        notify({
          ...input,
          userId: admin.id,
          idempotencyKey: `${input.idempotencyKey}:${admin.id}`,
        }),
      ),
    );
  } catch (error) {
    console.error("[Sooqna Notify] admin fan-out failed", error);
  }
}

import { deliverEmailSafely } from "@/services/email/email.service";
import {
  buildEmailDedupeKey,
  findRecentEmailLog,
  recordEmailLog,
  updateEmailLog,
  type EmailDeliveryStatus,
  type EmailEventType,
} from "@/services/email/email-log-store";
import {
  buildSooqnaEmailHtml,
  buildSooqnaEmailText,
} from "@/services/email/sooqna-email-template";

const DEFAULT_DEDUPE_MS = 24 * 60 * 60 * 1000;

export async function sendTransactionalEmail(input: {
  bodyHtml: string;
  bodyLines: string[];
  ctaHref?: string;
  ctaLabel?: string;
  dedupeWindowMs?: number;
  entityId: string;
  locale?: "ar" | "en";
  subject: string;
  title: string;
  to: string;
  type: EmailEventType;
  userId?: string;
}): Promise<EmailDeliveryStatus> {
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return "failed";

  const dedupeKey = buildEmailDedupeKey({
    type: input.type,
    to,
    entityId: input.entityId,
  });
  const windowMs = input.dedupeWindowMs ?? DEFAULT_DEDUPE_MS;

  try {
    const duplicate = await findRecentEmailLog(dedupeKey, windowMs);
    if (duplicate) {
      await recordEmailLog({
        dedupeKey,
        entityId: input.entityId,
        status: "skipped",
        subject: input.subject,
        to,
        type: input.type,
        userId: input.userId,
      });
      return "skipped";
    }

    const pending = await recordEmailLog({
      dedupeKey,
      entityId: input.entityId,
      status: "pending",
      subject: input.subject,
      to,
      type: input.type,
      userId: input.userId,
    });

    const html = buildSooqnaEmailHtml({
      title: input.title,
      bodyHtml: input.bodyHtml,
      ctaHref: input.ctaHref,
      ctaLabel: input.ctaLabel,
      preview: input.subject,
      locale: input.locale,
    });
    const text = buildSooqnaEmailText({
      title: input.title,
      bodyLines: input.bodyLines,
      ctaHref: input.ctaHref,
      ctaLabel: input.ctaLabel,
      locale: input.locale,
    });

    const sent = await deliverEmailSafely({
      to,
      subject: input.subject,
      html,
      text,
    });

    await updateEmailLog(pending.id, {
      error: sent ? undefined : "delivery_failed",
      status: sent ? "sent" : "failed",
    });

    return sent ? "sent" : "failed";
  } catch (error) {
    await recordEmailLog({
      dedupeKey,
      entityId: input.entityId,
      error: error instanceof Error ? error.message : "unknown",
      status: "failed",
      subject: input.subject,
      to,
      type: input.type,
      userId: input.userId,
    }).catch(() => undefined);
    console.error("[Sooqna Email] transactional send failed", error);
    return "failed";
  }
}

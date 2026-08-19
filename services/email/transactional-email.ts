import { deliverEmailSafely } from "@/services/email/email.service";
import {
  buildEmailDedupeKey,
  findRecentEmailLog,
  getEmailLogById,
  listFailedEmailLogs,
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

    const html = buildSooqnaEmailHtml({
      title: input.title,
      bodyHtml: input.bodyHtml,
      ctaHref: input.ctaHref,
      ctaLabel: input.ctaLabel,
      preview: input.subject,
    });
    const text = buildSooqnaEmailText({
      title: input.title,
      bodyLines: input.bodyLines,
      ctaHref: input.ctaHref,
      ctaLabel: input.ctaLabel,
    });

    const pending = await recordEmailLog({
      dedupeKey,
      entityId: input.entityId,
      html,
      status: "pending",
      subject: input.subject,
      text,
      to,
      type: input.type,
      userId: input.userId,
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

/** Re-sends a failed/pending log. Never throws to the business caller. */
export async function retryEmailLog(
  id: string,
): Promise<EmailDeliveryStatus> {
  try {
    const item = await getEmailLogById(id);
    if (!item) return "failed";
    if (item.status === "sent" || item.status === "skipped") return "skipped";
    if (!item.html || !item.text) return "failed";

    await updateEmailLog(id, { error: undefined, status: "pending" });
    const sent = await deliverEmailSafely({
      to: item.to,
      subject: item.subject,
      html: item.html,
      text: item.text,
    });
    await updateEmailLog(id, {
      error: sent ? undefined : "delivery_failed",
      status: sent ? "sent" : "failed",
    });
    return sent ? "sent" : "failed";
  } catch (error) {
    console.error("[Sooqna Email] retry failed", error);
    return "failed";
  }
}

export async function retryFailedEmails(limit = 20): Promise<{
  retried: number;
  sent: number;
  failed: number;
}> {
  const failed = (await listFailedEmailLogs()).slice(0, limit);
  let sent = 0;
  let failedCount = 0;
  for (const item of failed) {
    const status = await retryEmailLog(item.id);
    if (status === "sent") sent += 1;
    else if (status === "failed") failedCount += 1;
  }
  return { retried: failed.length, sent, failed: failedCount };
}

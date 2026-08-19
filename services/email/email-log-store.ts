import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type EmailEventType =
  | "listing_received"
  | "listing_approved"
  | "listing_rejected"
  | "listing_featured"
  | "featured_paid"
  | "featured_payment_required"
  | "featured_expired"
  | "order_paid"
  | "order_seller_new"
  | "order_confirmed"
  | "order_preparing"
  | "order_shipped"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "order_released"
  | "order_refunded"
  | "order_disputed"
  | "order_dispute_resolved"
  | "payment_failed"
  | "seller_proof"
  | "escrow_held"
  | "escrow_released"
  | "chat_message"
  | "password_reset"
  | "welcome"
  | "viewing_booking"
  | "viewing_booking_update"
  | "quote_request"
  | "quote_request_update"
  | "job_application"
  | "job_application_update"
  | "favorite_price"
  | "favorite_sold"
  | "saved_search_match"
  | "admin_ops"
  | "listing_report";

export type EmailDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export type EmailLogRecord = {
  createdAt: string;
  dedupeKey: string;
  entityId: string;
  error?: string;
  id: string;
  status: EmailDeliveryStatus;
  subject: string;
  to: string;
  type: EmailEventType;
  userId?: string;
};

const FILE = "email-log.json";
const MAX_LOGS = 500;

export function buildEmailDedupeKey(input: {
  entityId: string;
  to: string;
  type: EmailEventType;
}): string {
  return `${input.type}:${input.to.trim().toLowerCase()}:${input.entityId}`;
}

export async function getEmailLogs(): Promise<EmailLogRecord[]> {
  return loadCollection<EmailLogRecord>(FILE);
}

export async function findRecentEmailLog(
  dedupeKey: string,
  windowMs: number,
): Promise<EmailLogRecord | undefined> {
  const logs = await getEmailLogs();
  const cutoff = Date.now() - windowMs;
  return logs.find((item) => {
    if (item.dedupeKey !== dedupeKey) return false;
    const created = new Date(item.createdAt).getTime();
    if (created < cutoff) return false;
    if (item.status === "sent") return true;
    if (item.status === "pending" && Date.now() - created < 2 * 60 * 1000) {
      return true;
    }
    return false;
  });
}

export async function updateEmailLog(
  id: string,
  patch: Partial<Pick<EmailLogRecord, "status" | "error">>,
): Promise<void> {
  const logs = await getEmailLogs();
  const index = logs.findIndex((item) => item.id === id);
  if (index < 0) return;
  logs[index] = { ...logs[index], ...patch };
  await saveCollection(FILE, logs);
}

export async function recordEmailLog(
  input: Omit<EmailLogRecord, "id" | "createdAt">,
): Promise<EmailLogRecord> {
  const logs = await getEmailLogs();
  const record: EmailLogRecord = {
    ...input,
    id: `eml-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  logs.unshift(record);
  await saveCollection(FILE, logs.slice(0, MAX_LOGS));
  return record;
}

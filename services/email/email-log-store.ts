import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type EmailEventType =
  | "listing_received"
  | "listing_approved"
  | "listing_rejected"
  | "order_paid"
  | "order_seller_new"
  | "order_confirmed"
  | "order_released"
  | "order_refunded"
  | "order_disputed"
  | "seller_proof"
  | "chat_message"
  | "password_reset";

export type EmailDeliveryStatus = "sent" | "failed" | "skipped";

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
  return logs.find(
    (item) =>
      item.dedupeKey === dedupeKey &&
      item.status === "sent" &&
      new Date(item.createdAt).getTime() >= cutoff,
  );
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

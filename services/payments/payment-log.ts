import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { PaymentEventLog } from "@/types/domain/payment";

const PAYMENT_LOG_FILE = "payment-events.json";
const PROCESSED_EVENTS_FILE = "stripe-webhook-events.json";

type ProcessedStripeEvent = {
  id: string;
  type: string;
  processedAt: string;
};

export async function logPaymentEvent(
  input: Omit<PaymentEventLog, "id" | "createdAt">,
): Promise<void> {
  const events = await loadCollection<PaymentEventLog>(PAYMENT_LOG_FILE);
  events.unshift({
    ...input,
    id: `pel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });
  await saveCollection(PAYMENT_LOG_FILE, events.slice(0, 500));
}

export async function getPaymentEvents(): Promise<PaymentEventLog[]> {
  return loadCollection<PaymentEventLog>(PAYMENT_LOG_FILE);
}

/** Returns true if this Stripe event id was already handled. */
export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<"new" | "duplicate"> {
  const rows = await loadCollection<ProcessedStripeEvent>(PROCESSED_EVENTS_FILE);
  if (rows.some((row) => row.id === eventId)) {
    return "duplicate";
  }
  rows.unshift({
    id: eventId,
    type: eventType,
    processedAt: new Date().toISOString(),
  });
  await saveCollection(PROCESSED_EVENTS_FILE, rows.slice(0, 1000));
  return "new";
}

/** Drop a claimed event so Stripe can retry after a handler failure. */
export async function releaseStripeWebhookEvent(eventId: string): Promise<void> {
  const rows = await loadCollection<ProcessedStripeEvent>(PROCESSED_EVENTS_FILE);
  await saveCollection(
    PROCESSED_EVENTS_FILE,
    rows.filter((row) => row.id !== eventId),
  );
}

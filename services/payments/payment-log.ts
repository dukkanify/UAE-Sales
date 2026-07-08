import type { PaymentEventLog } from "@/types/domain/payment";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const PAYMENT_LOG_FILE = "payment-events.json";

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

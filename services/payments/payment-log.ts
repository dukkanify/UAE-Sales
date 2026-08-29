import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";
import { getOptionalPostgresPool } from "@/services/db/postgres";
import type { PaymentEventLog } from "@/types/domain/payment";

const paymentEvents = createPayloadCollectionStore<PaymentEventLog>({
  table: "payment_event_logs",
  fileName: "sooqna-payment-events.json",
});

type ProcessedStripeEvent = {
  id: string;
  type: string;
  processedAt: string;
};

const processedEvents = createPayloadCollectionStore<ProcessedStripeEvent>({
  table: "stripe_webhook_events",
  fileName: "sooqna-stripe-webhook-events.json",
});

let claimTableReady = false;

async function ensureClaimTable(): Promise<boolean> {
  const pool = await getOptionalPostgresPool();
  if (!pool) return false;
  if (claimTableReady) return true;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stripe_webhook_claims (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  claimTableReady = true;
  return true;
}

export async function logPaymentEvent(
  input: Omit<PaymentEventLog, "id" | "createdAt">,
): Promise<void> {
  const event: PaymentEventLog = {
    ...input,
    id: `pel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await paymentEvents.upsert(event);
}

export async function getPaymentEvents(): Promise<PaymentEventLog[]> {
  const events = await paymentEvents.listAll();
  return events.slice(0, 500);
}

/** Atomic claim — Postgres INSERT ON CONFLICT; durable JSON fallback. */
export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<"new" | "duplicate"> {
  if (await ensureClaimTable()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return "duplicate";
    try {
      const result = await pool.query(
        `INSERT INTO stripe_webhook_claims (event_id, event_type, processed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (event_id) DO NOTHING
         RETURNING event_id`,
        [eventId, eventType],
      );
      return result.rows[0] ? "new" : "duplicate";
    } catch {
      return "duplicate";
    }
  }

  const rows = await processedEvents.listAll();
  if (rows.some((row) => row.id === eventId)) {
    return "duplicate";
  }
  await processedEvents.upsert({
    id: eventId,
    type: eventType,
    processedAt: new Date().toISOString(),
  });
  return "new";
}

export async function releaseStripeWebhookEvent(eventId: string): Promise<void> {
  if (await ensureClaimTable()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return;
    await pool.query(`DELETE FROM stripe_webhook_claims WHERE event_id = $1`, [
      eventId,
    ]);
    return;
  }
  await processedEvents.removeById(eventId);
}

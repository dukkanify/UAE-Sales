/**
 * Outbound webhook delivery + inbound verification helpers.
 */

import { createHmac, timingSafeEqual } from "crypto";

import { generateId, generateToken } from "@/lib/security/crypto";
import { enqueueJob } from "@/services/api-platform/queue-service";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { ApiError } from "@/lib/api/envelope";
import type { WebhookEndpoint, WebhookEventType } from "@/types/api-platform";

export function listWebhookEndpoints() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().webhookEndpoints.map((e) => ({
    ...e,
    secret: `${e.secret.slice(0, 8)}…`,
  }));
}

export function createWebhookEndpoint(input: {
  url: string;
  description?: string;
  events: WebhookEventType[];
}) {
  ensureApiPlatformSeeded();
  if (!/^https?:\/\//i.test(input.url)) {
    throw new ApiError(400, "invalid_url", "Webhook URL must be http(s)");
  }
  const endpoint: WebhookEndpoint = {
    id: generateId(),
    url: input.url,
    description: (input.description ?? "").slice(0, 500),
    secret: `whsec_${generateToken(24)}`,
    events: input.events.length ? input.events : ["integration.test"],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failureCount: 0,
    lastDeliveryAt: null,
  };
  const db = ensureApiPlatformStore();
  db.webhookEndpoints.unshift(endpoint);
  writeApiPlatformStore(db);
  return endpoint;
}

export function updateWebhookEndpoint(
  id: string,
  patch: Partial<Pick<WebhookEndpoint, "url" | "description" | "events" | "active">>,
) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const row = db.webhookEndpoints.find((e) => e.id === id);
  if (!row) throw new ApiError(404, "not_found", "Webhook endpoint not found");
  Object.assign(row, patch);
  row.updatedAt = new Date().toISOString();
  writeApiPlatformStore(db);
  return { ...row, secret: `${row.secret.slice(0, 8)}…` };
}

export function signWebhookPayload(secret: string, body: string, timestamp: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function verifyWebhookSignature(
  secret: string,
  body: string,
  timestamp: string,
  signature: string,
) {
  const expected = signWebhookPayload(secret, body, timestamp);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function matchesEvent(subscribed: WebhookEventType[], eventType: string) {
  return subscribed.some((s) => {
    if (s === eventType) return true;
    if (s.endsWith(".*")) {
      const prefix = s.slice(0, -1);
      return eventType.startsWith(prefix);
    }
    return false;
  });
}

/** Enqueue outbound deliveries for matching endpoints. */
export function dispatchWebhookEvent(eventType: string, payload: Record<string, unknown>) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const now = new Date().toISOString();
  const created: string[] = [];
  for (const endpoint of db.webhookEndpoints) {
    if (!endpoint.active) continue;
    if (!matchesEvent(endpoint.events, eventType)) continue;
    const delivery = {
      id: generateId(),
      endpointId: endpoint.id,
      eventType,
      payload: { id: generateId(), type: eventType, createdAt: now, data: payload },
      status: "pending" as const,
      attempts: 0,
      lastError: null,
      responseStatus: null,
      createdAt: now,
      deliveredAt: null,
    };
    db.webhookDeliveries.unshift(delivery);
    created.push(delivery.id);
    enqueueJob({
      type: "webhook",
      payload: { deliveryId: delivery.id },
      maxAttempts: 5,
    });
  }
  writeApiPlatformStore(db);
  return { queued: created.length, deliveryIds: created };
}

export async function processWebhookDelivery(deliveryId: string) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const delivery = db.webhookDeliveries.find((d) => d.id === deliveryId);
  if (!delivery) return { ok: false, error: "missing delivery" };
  const endpoint = db.webhookEndpoints.find((e) => e.id === delivery.endpointId);
  if (!endpoint) {
    delivery.status = "dead";
    delivery.lastError = "endpoint missing";
    writeApiPlatformStore(db);
    return { ok: false, error: "endpoint missing" };
  }

  delivery.attempts += 1;
  const body = JSON.stringify(delivery.payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signWebhookPayload(endpoint.secret, body, timestamp);

  try {
    // Local/dev: mark delivered without external call for non-http loopback test URLs
    // Still attempt fetch for real URLs; swallow network errors into retry.
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AEP-Event": delivery.eventType,
        "X-AEP-Timestamp": timestamp,
        "X-AEP-Signature": signature,
        "User-Agent": "ATPL-PASS-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(8000),
    }).catch((err: Error) => {
      throw err;
    });

    delivery.responseStatus = res.status;
    if (res.ok) {
      delivery.status = "delivered";
      delivery.deliveredAt = new Date().toISOString();
      delivery.lastError = null;
      endpoint.failureCount = 0;
      endpoint.lastDeliveryAt = delivery.deliveredAt;
      writeApiPlatformStore(db);
      return { ok: true };
    }
    delivery.lastError = `HTTP ${res.status}`;
  } catch (err) {
    delivery.lastError = err instanceof Error ? err.message : "delivery failed";
  }

  endpoint.failureCount += 1;
  if (delivery.attempts >= 5) delivery.status = "dead";
  else delivery.status = "failed";
  writeApiPlatformStore(db);
  return { ok: false, error: delivery.lastError };
}

export function listWebhookDeliveries(limit = 50) {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().webhookDeliveries.slice(0, limit);
}

export function getWebhookEndpointSecret(id: string) {
  ensureApiPlatformSeeded();
  const row = ensureApiPlatformStore().webhookEndpoints.find((e) => e.id === id);
  if (!row) throw new ApiError(404, "not_found", "Webhook endpoint not found");
  return { id: row.id, secret: row.secret };
}

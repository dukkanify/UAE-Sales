/**
 * API request logging + monitoring metrics.
 */

import { generateId } from "@/lib/security/crypto";
import { getQueueStatus } from "@/services/api-platform/queue-service";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { listIntegrations } from "@/services/api-platform/integration-service";
import { listWebhookDeliveries } from "@/services/api-platform/webhook-service";

export function logApiRequest(input: {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string | null;
  apiKeyId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  error?: string | null;
}) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  db.apiLogs.unshift({
    id: generateId(),
    method: input.method,
    path: input.path.slice(0, 500),
    status: input.status,
    durationMs: input.durationMs,
    userId: input.userId ?? null,
    apiKeyId: input.apiKeyId ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    error: input.error ?? null,
    createdAt: new Date().toISOString(),
  });
  writeApiPlatformStore(db);
}

export function listApiLogs(limit = 100) {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().apiLogs.slice(0, limit);
}

export function getApiMonitoringSummary() {
  ensureApiPlatformSeeded();
  const logs = ensureApiPlatformStore().apiLogs;
  const lastHour = Date.now() - 3600_000;
  const recent = logs.filter((l) => new Date(l.createdAt).getTime() >= lastHour);
  const failed = recent.filter((l) => l.status >= 400);
  const avgMs =
    recent.length === 0
      ? 0
      : Math.round(recent.reduce((s, l) => s + l.durationMs, 0) / recent.length);
  const webhookFails = listWebhookDeliveries(200).filter(
    (d) => d.status === "failed" || d.status === "dead",
  ).length;
  const integrations = listIntegrations().map((i) => ({
    provider: i.provider,
    status: i.status,
    enabled: i.enabled,
  }));

  return {
    requestsLastHour: recent.length,
    failedLastHour: failed.length,
    avgResponseMs: avgMs,
    queue: getQueueStatus(),
    webhookFailures: webhookFails,
    integrations,
    timestamp: new Date().toISOString(),
  };
}

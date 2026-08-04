/**
 * Integration settings catalog (Zoom, SMTP, Stripe, future providers).
 */

import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { ApiError } from "@/lib/api/envelope";
import type { IntegrationProvider } from "@/types/api-platform";

export function listIntegrations() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().integrations;
}

export function getIntegration(provider: IntegrationProvider) {
  ensureApiPlatformSeeded();
  const row = ensureApiPlatformStore().integrations.find((i) => i.provider === provider);
  if (!row) throw new ApiError(404, "not_found", `Integration ${provider} not found`);
  return row;
}

export function updateIntegration(
  provider: IntegrationProvider,
  patch: { enabled?: boolean; config?: Record<string, unknown>; notes?: string },
) {
  ensureApiPlatformSeeded();
  const db = ensureApiPlatformStore();
  const row = db.integrations.find((i) => i.provider === provider);
  if (!row) throw new ApiError(404, "not_found", `Integration ${provider} not found`);
  if (patch.enabled != null) row.enabled = patch.enabled;
  if (patch.config) row.config = { ...row.config, ...patch.config };
  if (patch.notes != null) row.notes = patch.notes;
  row.status = row.enabled ? (row.secretsPresent ? "configured" : "ready") : "disabled";
  row.updatedAt = new Date().toISOString();
  writeApiPlatformStore(db);
  return row;
}

export function listOAuthClients() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().oauthClients.map((c) => ({
    id: c.id,
    name: c.name,
    clientId: c.clientId,
    redirectUris: c.redirectUris,
    createdAt: c.createdAt,
  }));
}

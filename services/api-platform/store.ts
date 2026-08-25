/**
 * API platform durable store (Task 018).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { ApiPlatformDatabase } from "@/types/api-platform";

function dataFile() {
  return path.join(dataDir(), "aep-api-platform.json");
}

function emptyDb(): ApiPlatformDatabase {
  return {
    apiKeys: [],
    refreshTokens: [],
    webhookEndpoints: [],
    webhookDeliveries: [],
    integrations: [],
    queueJobs: [],
    importJobs: [],
    exportJobs: [],
    apiLogs: [],
    cacheMeta: [],
    oauthClients: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<ApiPlatformDatabase>): ApiPlatformDatabase {
  return {
    ...emptyDb(),
    ...raw,
    apiKeys: raw.apiKeys ?? [],
    refreshTokens: raw.refreshTokens ?? [],
    webhookEndpoints: raw.webhookEndpoints ?? [],
    webhookDeliveries: raw.webhookDeliveries ?? [],
    integrations: raw.integrations ?? [],
    queueJobs: raw.queueJobs ?? [],
    importJobs: raw.importJobs ?? [],
    exportJobs: raw.exportJobs ?? [],
    apiLogs: raw.apiLogs ?? [],
    cacheMeta: raw.cacheMeta ?? [],
    oauthClients: raw.oauthClients ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureApiPlatformStore(): ApiPlatformDatabase {
  const raw = readJsonFile<Partial<ApiPlatformDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function writeApiPlatformStore(db: ApiPlatformDatabase) {
  // Cap logs / deliveries
  if (db.apiLogs.length > 5000) db.apiLogs = db.apiLogs.slice(0, 5000);
  if (db.webhookDeliveries.length > 2000) {
    db.webhookDeliveries = db.webhookDeliveries.slice(0, 2000);
  }
  if (db.queueJobs.length > 2000) db.queueJobs = db.queueJobs.slice(0, 2000);
  writeJsonFile(dataFile(), db);
}

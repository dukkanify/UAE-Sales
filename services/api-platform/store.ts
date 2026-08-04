/**
 * API platform durable store (Task 018).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type { ApiPlatformDatabase } from "@/types/api-platform";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-api-platform.json");

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

export function ensureApiPlatformStore(): ApiPlatformDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<ApiPlatformDatabase>;
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
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function writeApiPlatformStore(db: ApiPlatformDatabase) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  // Cap logs / deliveries
  if (db.apiLogs.length > 5000) db.apiLogs = db.apiLogs.slice(0, 5000);
  if (db.webhookDeliveries.length > 2000) {
    db.webhookDeliveries = db.webhookDeliveries.slice(0, 2000);
  }
  if (db.queueJobs.length > 2000) db.queueJobs = db.queueJobs.slice(0, 2000);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

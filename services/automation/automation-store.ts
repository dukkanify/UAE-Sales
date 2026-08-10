/**
 * Super Admin Automation Center prefs (.data/aep-automation-center.json).
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { AutomationDomain } from "@/types/automation-center";

interface AutomationCenterDb {
  disabledDomains: AutomationDomain[];
  lastConfiguredAt: string | null;
  lastConfiguredById: string | null;
}

const DATA_FILE = path.join(dataDir(), "aep-automation-center.json");

function emptyDb(): AutomationCenterDb {
  return {
    disabledDomains: [],
    lastConfiguredAt: null,
    lastConfiguredById: null,
  };
}

function readDb(): AutomationCenterDb {
  const db = readJsonFile<AutomationCenterDb>(DATA_FILE, emptyDb);
  return {
    disabledDomains: Array.isArray(db.disabledDomains) ? db.disabledDomains : [],
    lastConfiguredAt: db.lastConfiguredAt ?? null,
    lastConfiguredById: db.lastConfiguredById ?? null,
  };
}

function writeDb(db: AutomationCenterDb) {
  writeJsonFile(DATA_FILE, db);
}

export function isDomainEnabled(domain: AutomationDomain): boolean {
  return !readDb().disabledDomains.includes(domain);
}

export function setDomainEnabled(
  domain: AutomationDomain,
  enabled: boolean,
  actorId: string | null,
) {
  const db = readDb();
  if (enabled) {
    db.disabledDomains = db.disabledDomains.filter((d) => d !== domain);
  } else if (!db.disabledDomains.includes(domain)) {
    db.disabledDomains.push(domain);
  }
  db.lastConfiguredAt = new Date().toISOString();
  db.lastConfiguredById = actorId;
  writeDb(db);
  return { domain, enabled };
}

export function touchAutomationConfigured(actorId: string | null) {
  const db = readDb();
  db.lastConfiguredAt = new Date().toISOString();
  db.lastConfiguredById = actorId;
  writeDb(db);
}

export function getAutomationMeta() {
  const db = readDb();
  return {
    disabledDomains: [...db.disabledDomains],
    lastConfiguredAt: db.lastConfiguredAt,
    lastConfiguredById: db.lastConfiguredById,
  };
}

export function resetAutomationCenterStoreForTests() {
  writeDb(emptyDb());
}

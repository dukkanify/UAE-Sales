/**
 * Durable automation dispatch log (.data/aep-email-automation.json).
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import { generateId } from "@/lib/security/crypto";
import type { EmailAutomationEvent, EmailAutomationLogEntry } from "@/types/email-automation";

interface AutomationDb {
  logs: EmailAutomationLogEntry[];
  disabledEvents: EmailAutomationEvent[];
}

const DATA_FILE = path.join(dataDir(), "aep-email-automation.json");

function emptyDb(): AutomationDb {
  return { logs: [], disabledEvents: [] };
}

function readDb(): AutomationDb {
  const db = readJsonFile<AutomationDb>(DATA_FILE, emptyDb);
  return {
    logs: Array.isArray(db.logs) ? db.logs : [],
    disabledEvents: Array.isArray(db.disabledEvents) ? db.disabledEvents : [],
  };
}

function writeDb(db: AutomationDb) {
  writeJsonFile(DATA_FILE, db);
}

export function isEventEnabled(event: EmailAutomationEvent): boolean {
  return !readDb().disabledEvents.includes(event);
}

export function setEventEnabled(event: EmailAutomationEvent, enabled: boolean) {
  const db = readDb();
  if (enabled) {
    db.disabledEvents = db.disabledEvents.filter((e) => e !== event);
  } else if (!db.disabledEvents.includes(event)) {
    db.disabledEvents.push(event);
  }
  writeDb(db);
  return { event, enabled };
}

export function listDisabledEvents(): EmailAutomationEvent[] {
  return [...readDb().disabledEvents];
}

export function appendAutomationLog(
  input: Omit<EmailAutomationLogEntry, "id" | "createdAt">,
): EmailAutomationLogEntry {
  const entry: EmailAutomationLogEntry = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const db = readDb();
  db.logs = [entry, ...db.logs].slice(0, 400);
  writeDb(db);
  return entry;
}

export function listAutomationLogs(limit = 40): EmailAutomationLogEntry[] {
  return readDb().logs.slice(0, limit);
}

export function getAutomationStats() {
  const logs = readDb().logs;
  const byEvent: Record<string, number> = {};
  let sent = 0;
  let failed = 0;
  for (const row of logs) {
    byEvent[row.event] = (byEvent[row.event] ?? 0) + 1;
    if (row.success) sent += 1;
    else failed += 1;
  }
  return { dispatched: logs.length, sent, failed, byEvent };
}

export function resetAutomationStoreForTests() {
  writeDb(emptyDb());
}

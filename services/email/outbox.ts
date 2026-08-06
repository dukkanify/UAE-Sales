/**
 * Durable email outbox — every outbound message is recorded for audit / local preview.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";

export type EmailDeliveryMode = "smtp" | "outbox" | "failed";

export interface OutboundEmailRecord {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  from: string;
  replyTo?: string;
  provider: string;
  mode: EmailDeliveryMode;
  error?: string | null;
  meta?: Record<string, unknown>;
  createdAt: string;
}

interface OutboxDb {
  messages: OutboundEmailRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-email-outbox.json");

function readOutbox(): OutboxDb {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const empty: OutboxDb = { messages: [] };
    writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as OutboxDb;
  } catch {
    return { messages: [] };
  }
}

function writeOutbox(db: OutboxDb) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function recordOutboundEmail(
  input: Omit<OutboundEmailRecord, "id" | "createdAt">,
): OutboundEmailRecord {
  const record: OutboundEmailRecord = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const db = readOutbox();
  db.messages.unshift(record);
  // Keep last 500 for local/demo inspection
  db.messages = db.messages.slice(0, 500);
  writeOutbox(db);
  return record;
}

export function listOutboundEmails(limit = 50): OutboundEmailRecord[] {
  return readOutbox().messages.slice(0, limit);
}

export function getLatestOutboundTo(email: string): OutboundEmailRecord | null {
  const needle = email.trim().toLowerCase();
  return readOutbox().messages.find((m) => m.to.toLowerCase() === needle) ?? null;
}

/**
 * Durable email outbox — every outbound message is recorded for audit / local preview.
 * Uses the shared JSON store so reads stay consistent in-process even when parallel
 * Vitest workers race on the underlying `.data` file.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
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

const DATA_FILE = path.join(dataDir(), "aep-email-outbox.json");

function emptyOutbox(): OutboxDb {
  return { messages: [] };
}

function readOutbox(): OutboxDb {
  const db = readJsonFile<OutboxDb>(DATA_FILE, emptyOutbox);
  if (!Array.isArray(db.messages)) return emptyOutbox();
  return db;
}

function writeOutbox(db: OutboxDb) {
  writeJsonFile(DATA_FILE, db);
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
  // Deduplicate by id in case a stale disk snapshot is merged later.
  db.messages = [record, ...db.messages.filter((m) => m.id !== record.id)].slice(0, 500);
  writeOutbox(db);
  return record;
}

export function listOutboundEmails(limit = 50): OutboundEmailRecord[] {
  return readOutbox().messages.slice(0, limit);
}

export function getOutboundById(id: string): OutboundEmailRecord | null {
  if (!id) return null;
  return readOutbox().messages.find((m) => m.id === id) ?? null;
}

export function getLatestOutboundTo(email: string): OutboundEmailRecord | null {
  const needle = email.trim().toLowerCase();
  return readOutbox().messages.find((m) => m.to.toLowerCase() === needle) ?? null;
}

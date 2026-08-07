/**
 * Centralized application / error / security / API logging.
 * Uses the shared JSON store so serverless/read-only hosts keep serving from memory.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import { generateId } from "@/lib/security/crypto";

export type OpsLogLevel = "debug" | "info" | "warn" | "error";
export type OpsLogCategory =
  "application" | "error" | "security" | "audit" | "api" | "job" | "backup";

export interface OpsLogEntry {
  id: string;
  level: OpsLogLevel;
  category: OpsLogCategory;
  message: string;
  details?: Record<string, unknown>;
  path?: string | null;
  userId?: string | null;
  createdAt: string;
}

interface OpsLogDatabase {
  entries: OpsLogEntry[];
}

const DATA_FILE = path.join(dataDir(), "aep-ops-logs.json");
const MAX_ENTRIES = 5000;

function emptyDb(): OpsLogDatabase {
  return { entries: [] };
}

function readDb(): OpsLogDatabase {
  const db = readJsonFile<OpsLogDatabase>(DATA_FILE, emptyDb);
  if (!Array.isArray(db.entries)) return emptyDb();
  return db;
}

function writeDb(db: OpsLogDatabase) {
  writeJsonFile(DATA_FILE, db);
}

export function writeOpsLog(input: {
  level: OpsLogLevel;
  category: OpsLogCategory;
  message: string;
  details?: Record<string, unknown>;
  path?: string | null;
  userId?: string | null;
}): OpsLogEntry {
  const entry: OpsLogEntry = {
    id: generateId(),
    level: input.level,
    category: input.category,
    message: input.message.slice(0, 2000),
    details: input.details,
    path: input.path ?? null,
    userId: input.userId ?? null,
    createdAt: new Date().toISOString(),
  };
  const db = readDb();
  db.entries.unshift(entry);
  if (db.entries.length > MAX_ENTRIES) db.entries = db.entries.slice(0, MAX_ENTRIES);
  writeDb(db);

  const line = `[${entry.level}] [${entry.category}] ${entry.message}`;
  if (entry.level === "error") console.error(line);
  else if (entry.level === "warn") console.warn(line);

  return entry;
}

export function listOpsLogs(filters?: {
  category?: OpsLogCategory | "all";
  level?: OpsLogLevel | "all";
  q?: string;
  limit?: number;
}): OpsLogEntry[] {
  let rows = readDb().entries;
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.level && filters.level !== "all") {
    rows = rows.filter((r) => r.level === filters.level);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.message.toLowerCase().includes(q) ||
        r.path?.toLowerCase().includes(q) ||
        r.userId?.toLowerCase().includes(q),
    );
  }
  return rows.slice(0, filters?.limit ?? 200);
}

export function exportOpsLogsCsv(limit = 500): string {
  const rows = listOpsLogs({ limit });
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    "id,level,category,message,path,userId,createdAt",
    ...rows.map((r) =>
      [
        r.id,
        r.level,
        r.category,
        esc(r.message),
        esc(r.path ?? ""),
        esc(r.userId ?? ""),
        r.createdAt,
      ].join(","),
    ),
  ].join("\n");
}

export function logApiRequest(input: {
  method: string;
  path: string;
  status: number;
  userId?: string | null;
  durationMs?: number;
}) {
  writeOpsLog({
    level: input.status >= 500 ? "error" : input.status >= 400 ? "warn" : "info",
    category: "api",
    message: `${input.method} ${input.path} → ${input.status}`,
    details: { durationMs: input.durationMs },
    path: input.path,
    userId: input.userId,
  });
}

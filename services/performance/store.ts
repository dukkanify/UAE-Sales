/**
 * Performance reports durable store (.data/aep-performance-reports.json).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import type { PerformanceReport } from "@/types/performance-reports";

export interface PerformanceReportsDatabase {
  reports: PerformanceReport[];
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-performance-reports.json");

function emptyDb(): PerformanceReportsDatabase {
  return { reports: [], seeded: false };
}

let cache: PerformanceReportsDatabase | null = null;

export function readPerformanceDb(): PerformanceReportsDatabase {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as PerformanceReportsDatabase;
      cache = {
        reports: parsed.reports ?? [],
        seeded: Boolean(parsed.seeded),
      };
      return cache;
    }
  } catch {
    // fall through
  }
  cache = emptyDb();
  return cache;
}

export function writePerformanceDb(
  mutator: (db: PerformanceReportsDatabase) => void,
): PerformanceReportsDatabase {
  const db = structuredClone(readPerformanceDb());
  mutator(db);
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  cache = db;
  return db;
}

export function resetPerformanceDbCache(): void {
  cache = null;
}

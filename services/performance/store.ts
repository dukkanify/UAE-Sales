/**
 * Performance reports durable store (.data/aep-performance-reports.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import {
  clearJsonFileCache,
  dataDir,
  readJsonFile,
  writeJsonFile,
} from "@/lib/data/json-file-store";
import type { PerformanceReport } from "@/types/performance-reports";

export interface PerformanceReportsDatabase {
  reports: PerformanceReport[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-performance-reports.json");
}

function emptyDb(): PerformanceReportsDatabase {
  return { reports: [], seeded: false };
}

function normalizeDb(raw: Partial<PerformanceReportsDatabase>): PerformanceReportsDatabase {
  return {
    ...emptyDb(),
    ...raw,
    reports: raw.reports ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function readPerformanceDb(): PerformanceReportsDatabase {
  const raw = readJsonFile<Partial<PerformanceReportsDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function writePerformanceDb(
  mutator: (db: PerformanceReportsDatabase) => void,
): PerformanceReportsDatabase {
  const db = readPerformanceDb();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}

export function resetPerformanceDbCache(): void {
  clearJsonFileCache(dataFile());
}

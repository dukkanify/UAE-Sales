/**
 * Analytics durable store — prefs, saved/scheduled reports, cache (not source facts).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  AnalyticsCacheEntry,
  ReportHistoryEntry,
  SavedReport,
  ScheduledReport,
  UserDashboardPrefs,
} from "@/types/analytics";

export interface AnalyticsDatabase {
  prefs: UserDashboardPrefs[];
  savedReports: SavedReport[];
  scheduledReports: ScheduledReport[];
  reportHistory: ReportHistoryEntry[];
  cache: AnalyticsCacheEntry[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-analytics.json");
}

function emptyDb(): AnalyticsDatabase {
  return {
    prefs: [],
    savedReports: [],
    scheduledReports: [],
    reportHistory: [],
    cache: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<AnalyticsDatabase>): AnalyticsDatabase {
  return {
    ...emptyDb(),
    ...raw,
    prefs: raw.prefs ?? [],
    savedReports: raw.savedReports ?? [],
    scheduledReports: raw.scheduledReports ?? [],
    reportHistory: raw.reportHistory ?? [],
    cache: raw.cache ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureAnalyticsStore(): AnalyticsDatabase {
  const raw = readJsonFile<Partial<AnalyticsDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readAnalyticsDb(): AnalyticsDatabase {
  return ensureAnalyticsStore();
}

export function writeAnalyticsDb(mutator: (db: AnalyticsDatabase) => void): AnalyticsDatabase {
  const db = ensureAnalyticsStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}

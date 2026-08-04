/**
 * Analytics durable store — prefs, saved/scheduled reports, cache (not source facts).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-analytics.json");

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

export function ensureAnalyticsStore(): AnalyticsDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<AnalyticsDatabase>;
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
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readAnalyticsDb(): AnalyticsDatabase {
  return ensureAnalyticsStore();
}

export function writeAnalyticsDb(
  mutator: (db: AnalyticsDatabase) => void,
): AnalyticsDatabase {
  const db = ensureAnalyticsStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}

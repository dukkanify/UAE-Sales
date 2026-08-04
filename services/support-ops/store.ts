/**
 * Support / ops durable store (Task 017).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type {
  BackupVerificationReport,
  BugReport,
  ChangeRequest,
  IncidentReport,
  MaintenanceLog,
  OpsAlert,
  ReleaseNote,
  RoadmapItem,
  SlaPolicy,
  SupportRequest,
  SystemHealthLog,
} from "@/types/support-ops";

export interface SupportOpsDatabase {
  sla: SlaPolicy;
  supportRequests: SupportRequest[];
  bugs: BugReport[];
  changeRequests: ChangeRequest[];
  releases: ReleaseNote[];
  maintenanceLogs: MaintenanceLog[];
  incidents: IncidentReport[];
  roadmapItems: RoadmapItem[];
  healthLogs: SystemHealthLog[];
  alerts: OpsAlert[];
  backupReports: BackupVerificationReport[];
  counters: {
    support: number;
    bug: number;
    cr: number;
    incident: number;
  };
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-support-ops.json");

export const DEFAULT_SLA: SlaPolicy = {
  critical: { responseHours: 2, resolutionHours: 8 },
  high: { responseHours: 8, resolutionHours: 24 },
  medium: { responseHours: 24, resolutionHours: 72 },
  low: { responseHours: 48, resolutionHours: 120 },
  updatedAt: new Date(0).toISOString(),
  updatedBy: null,
};

function emptyDb(): SupportOpsDatabase {
  return {
    sla: { ...DEFAULT_SLA },
    supportRequests: [],
    bugs: [],
    changeRequests: [],
    releases: [],
    maintenanceLogs: [],
    incidents: [],
    roadmapItems: [],
    healthLogs: [],
    alerts: [],
    backupReports: [],
    counters: { support: 0, bug: 0, cr: 0, incident: 0 },
    seeded: false,
  };
}

export function ensureSupportOpsStore(): SupportOpsDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<SupportOpsDatabase>;
    return {
      ...emptyDb(),
      ...raw,
      sla: { ...DEFAULT_SLA, ...(raw.sla ?? {}) },
      counters: { ...emptyDb().counters, ...(raw.counters ?? {}) },
      supportRequests: raw.supportRequests ?? [],
      bugs: raw.bugs ?? [],
      changeRequests: raw.changeRequests ?? [],
      releases: raw.releases ?? [],
      maintenanceLogs: raw.maintenanceLogs ?? [],
      incidents: raw.incidents ?? [],
      roadmapItems: raw.roadmapItems ?? [],
      healthLogs: raw.healthLogs ?? [],
      alerts: raw.alerts ?? [],
      backupReports: raw.backupReports ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function writeSupportOpsStore(db: SupportOpsDatabase) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export function nextNumber(
  db: SupportOpsDatabase,
  prefix: "SUP" | "BUG" | "CR" | "INC",
  key: keyof SupportOpsDatabase["counters"],
) {
  db.counters[key] += 1;
  return `${prefix}-${String(db.counters[key]).padStart(4, "0")}`;
}

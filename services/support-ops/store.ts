/**
 * Support / ops durable store (Tasks 017 / 021).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  BackupVerificationReport,
  BugReport,
  ChangeRequest,
  CustomerFeedback,
  FeatureRequest,
  HypercarePeriod,
  IncidentReport,
  KnowledgeArticle,
  MaintenanceLog,
  OpsAlert,
  OptimizationNote,
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
  featureRequests: FeatureRequest[];
  releases: ReleaseNote[];
  maintenanceLogs: MaintenanceLog[];
  incidents: IncidentReport[];
  roadmapItems: RoadmapItem[];
  healthLogs: SystemHealthLog[];
  alerts: OpsAlert[];
  backupReports: BackupVerificationReport[];
  knowledgeArticles: KnowledgeArticle[];
  feedback: CustomerFeedback[];
  optimizationNotes: OptimizationNote[];
  hypercare: HypercarePeriod;
  counters: {
    support: number;
    bug: number;
    cr: number;
    incident: number;
    feature: number;
  };
  /** 1 = Task 017 baseline; 2 = Task 021 post-launch modules */
  seedVersion: number;
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-support-ops.json");
}

export const DEFAULT_SLA: SlaPolicy = {
  critical: { responseHours: 2, resolutionHours: 8 },
  high: { responseHours: 8, resolutionHours: 24 },
  medium: { responseHours: 24, resolutionHours: 72 },
  low: { responseHours: 48, resolutionHours: 120 },
  updatedAt: new Date(0).toISOString(),
  updatedBy: null,
};

export const DEFAULT_HYPERCARE: HypercarePeriod = {
  enabled: false,
  label: "Post-launch hypercare",
  startedAt: null,
  endsAt: null,
  notes: "",
  watchModules: ["auth", "courses", "live_classes", "payments", "zoom", "email", "api"],
  checkIns: [],
  updatedAt: new Date(0).toISOString(),
};

function emptyDb(): SupportOpsDatabase {
  return {
    sla: { ...DEFAULT_SLA },
    supportRequests: [],
    bugs: [],
    changeRequests: [],
    featureRequests: [],
    releases: [],
    maintenanceLogs: [],
    incidents: [],
    roadmapItems: [],
    healthLogs: [],
    alerts: [],
    backupReports: [],
    knowledgeArticles: [],
    feedback: [],
    optimizationNotes: [],
    hypercare: { ...DEFAULT_HYPERCARE, checkIns: [] },
    counters: { support: 0, bug: 0, cr: 0, incident: 0, feature: 0 },
    seedVersion: 0,
    seeded: false,
  };
}

function normalizeDb(raw: Partial<SupportOpsDatabase>): SupportOpsDatabase {
  const base = emptyDb();
  return {
    ...base,
    ...raw,
    sla: { ...DEFAULT_SLA, ...(raw.sla ?? {}) },
    hypercare: {
      ...DEFAULT_HYPERCARE,
      ...(raw.hypercare ?? {}),
      checkIns: raw.hypercare?.checkIns ?? [],
      watchModules: raw.hypercare?.watchModules ?? DEFAULT_HYPERCARE.watchModules,
    },
    counters: { ...base.counters, ...(raw.counters ?? {}) },
    supportRequests: raw.supportRequests ?? [],
    bugs: raw.bugs ?? [],
    changeRequests: raw.changeRequests ?? [],
    featureRequests: raw.featureRequests ?? [],
    releases: raw.releases ?? [],
    maintenanceLogs: raw.maintenanceLogs ?? [],
    incidents: (raw.incidents ?? []).map((inc) => ({
      ...inc,
      affectedModule: inc.affectedModule ?? "general",
      rootCause: inc.rootCause ?? null,
      resolution: inc.resolution ?? null,
      preventiveAction: inc.preventiveAction ?? null,
    })),
    roadmapItems: raw.roadmapItems ?? [],
    healthLogs: raw.healthLogs ?? [],
    alerts: raw.alerts ?? [],
    backupReports: raw.backupReports ?? [],
    knowledgeArticles: raw.knowledgeArticles ?? [],
    feedback: raw.feedback ?? [],
    optimizationNotes: (raw.optimizationNotes ?? []).map((n) => {
      const legacy = n as OptimizationNote & { action?: string };
      return {
        ...n,
        recommendedAction: legacy.recommendedAction ?? legacy.action ?? "",
      };
    }),
    seedVersion: Number(raw.seedVersion ?? (raw.seeded ? 1 : 0)),
    seeded: Boolean(raw.seeded),
  };
}

export function ensureSupportOpsStore(): SupportOpsDatabase {
  const raw = readJsonFile<Partial<SupportOpsDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function writeSupportOpsStore(db: SupportOpsDatabase) {
  writeJsonFile(dataFile(), db);
}

export function nextNumber(
  db: SupportOpsDatabase,
  prefix: "SUP" | "BUG" | "CR" | "INC" | "FEAT",
  key: keyof SupportOpsDatabase["counters"],
) {
  db.counters[key] += 1;
  return `${prefix}-${String(db.counters[key]).padStart(4, "0")}`;
}

/**
 * Post-launch ops modules — hypercare, features, KB, feedback, optimization (Task 021).
 */

import { generateId } from "@/lib/security/crypto";
import { writeOpsLog } from "@/services/ops/logging-service";
import { getPlatformSettings, isMaintenanceMode } from "@/services/settings/settings-service";
import { ensureSupportOpsSeeded } from "@/services/support-ops/seed";
import {
  DEFAULT_HYPERCARE,
  DEFAULT_SLA,
  nextNumber,
  writeSupportOpsStore,
} from "@/services/support-ops/store";
import type {
  CustomerFeedback,
  DevelopmentStatus,
  FeatureApprovalStatus,
  FeatureRequest,
  HypercareCheckIn,
  HypercarePeriod,
  HypercareStability,
  KnowledgeArticle,
  KnowledgeAudience,
  KnowledgeCategory,
  OptimizationNote,
  SupportPriority,
} from "@/types/support-ops";

function now() {
  return new Date().toISOString();
}

function ensure() {
  return ensureSupportOpsSeeded();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/* ─── Hypercare ───────────────────────────────────────── */

export function getHypercare(): HypercarePeriod {
  return ensure().hypercare ?? { ...DEFAULT_HYPERCARE, checkIns: [] };
}

export function updateHypercare(
  patch: Partial<
    Pick<HypercarePeriod, "enabled" | "label" | "startedAt" | "endsAt" | "notes" | "watchModules">
  >,
): HypercarePeriod {
  const db = ensure();
  db.hypercare = {
    ...db.hypercare,
    ...patch,
    watchModules: patch.watchModules ?? db.hypercare.watchModules,
    updatedAt: now(),
  };
  if (patch.enabled === true && !db.hypercare.startedAt) {
    db.hypercare.startedAt = now();
  }
  writeSupportOpsStore(db);
  writeOpsLog({
    level: "info",
    category: "audit",
    message: `Hypercare ${db.hypercare.enabled ? "enabled" : "updated"}`,
  });
  return db.hypercare;
}

export function addHypercareCheckIn(input: {
  summary: string;
  stability: HypercareStability;
  openCritical?: number;
  openHigh?: number;
  notes?: string;
  actorId?: string | null;
}): HypercareCheckIn {
  const db = ensure();
  const openCritical =
    input.openCritical ??
    db.incidents.filter(
      (i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status),
    ).length;
  const openHigh =
    input.openHigh ??
    db.supportRequests.filter(
      (r) => r.priority === "high" && !["resolved", "closed"].includes(r.status),
    ).length +
      db.bugs.filter((b) => b.priority === "high" && !["verified", "closed"].includes(b.status))
        .length;

  const row: HypercareCheckIn = {
    id: generateId(),
    at: now(),
    actorId: input.actorId ?? null,
    summary: input.summary.slice(0, 2000),
    stability: input.stability,
    openCritical,
    openHigh,
    notes: (input.notes ?? "").slice(0, 2000),
  };
  db.hypercare.checkIns.unshift(row);
  if (db.hypercare.checkIns.length > 100)
    db.hypercare.checkIns = db.hypercare.checkIns.slice(0, 100);
  db.hypercare.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Feature requests ────────────────────────────────── */

export function listFeatureRequests(filters?: {
  approvalStatus?: FeatureApprovalStatus | "all";
  priority?: SupportPriority | "all";
  q?: string;
}) {
  let rows = [...ensure().featureRequests];
  if (filters?.approvalStatus && filters.approvalStatus !== "all") {
    rows = rows.filter((r) => r.approvalStatus === filters.approvalStatus);
  }
  if (filters?.priority && filters.priority !== "all") {
    rows = rows.filter((r) => r.priority === filters.priority);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createFeatureRequest(input: {
  title: string;
  description: string;
  businessValue: string;
  priority?: SupportPriority;
  estimatedEffortHours?: number | null;
  estimatedCost?: number | null;
  currency?: string;
  targetVersion?: string | null;
  requestedBy?: string | null;
}): FeatureRequest {
  const db = ensure();
  const number = nextNumber(db, "FEAT", "feature");
  const row: FeatureRequest = {
    id: generateId(),
    number,
    title: input.title.slice(0, 200),
    description: input.description.slice(0, 5000),
    businessValue: input.businessValue.slice(0, 2000),
    priority: input.priority ?? "medium",
    estimatedEffortHours: input.estimatedEffortHours ?? null,
    estimatedCost: input.estimatedCost ?? null,
    currency: input.currency ?? "USD",
    approvalStatus: "pending",
    developmentStatus: "not_started",
    requestedBy: input.requestedBy ?? null,
    approvedBy: null,
    targetVersion: input.targetVersion ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.featureRequests.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateFeatureRequest(
  id: string,
  patch: Partial<
    Pick<
      FeatureRequest,
      | "title"
      | "description"
      | "businessValue"
      | "priority"
      | "estimatedEffortHours"
      | "estimatedCost"
      | "approvalStatus"
      | "developmentStatus"
      | "targetVersion"
    >
  >,
  actorId?: string | null,
): FeatureRequest {
  const db = ensure();
  const row = db.featureRequests.find((r) => r.id === id);
  if (!row) throw new Error("Feature request not found");
  Object.assign(row, patch);
  if (patch.approvalStatus === "approved") row.approvedBy = actorId ?? row.approvedBy;
  if (patch.developmentStatus === "done") row.developmentStatus = "done";
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Knowledge base ──────────────────────────────────── */

export function listKnowledgeArticles(filters?: {
  category?: KnowledgeCategory | "all";
  audience?: KnowledgeAudience | "all";
  published?: boolean | "all";
  q?: string;
}) {
  let rows = [...ensure().knowledgeArticles];
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.audience && filters.audience !== "all") {
    rows = rows.filter((r) => r.audience === filters.audience || r.audience === "all");
  }
  if (filters?.published !== undefined && filters.published !== "all") {
    rows = rows.filter((r) => r.published === filters.published);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createKnowledgeArticle(input: {
  title: string;
  summary: string;
  body: string;
  category: KnowledgeCategory;
  audience?: KnowledgeAudience;
  published?: boolean;
  tags?: string[];
  updatedBy?: string | null;
}): KnowledgeArticle {
  const db = ensure();
  const baseSlug = slugify(input.title) || generateId().slice(0, 8);
  let slug = baseSlug;
  let n = 1;
  while (db.knowledgeArticles.some((a) => a.slug === slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  const row: KnowledgeArticle = {
    id: generateId(),
    slug,
    title: input.title.slice(0, 200),
    summary: input.summary.slice(0, 500),
    body: input.body.slice(0, 20000),
    category: input.category,
    audience: input.audience ?? "internal",
    published: Boolean(input.published ?? true),
    tags: (input.tags ?? []).map((t) => t.slice(0, 40)).slice(0, 20),
    updatedBy: input.updatedBy ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.knowledgeArticles.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateKnowledgeArticle(
  id: string,
  patch: Partial<
    Pick<
      KnowledgeArticle,
      "title" | "summary" | "body" | "category" | "audience" | "published" | "tags"
    >
  >,
  actorId?: string | null,
): KnowledgeArticle {
  const db = ensure();
  const row = db.knowledgeArticles.find((r) => r.id === id);
  if (!row) throw new Error("Knowledge article not found");
  Object.assign(row, patch);
  row.updatedBy = actorId ?? row.updatedBy;
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Customer feedback ───────────────────────────────── */

export function listFeedback(filters?: {
  category?: CustomerFeedback["category"] | "all";
  status?: CustomerFeedback["status"] | "all";
}) {
  let rows = [...ensure().feedback];
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createFeedback(input: {
  category: CustomerFeedback["category"];
  title: string;
  comment: string;
  rating?: number | null;
  submitterEmail?: string | null;
  submitterRole?: string | null;
}): CustomerFeedback {
  const db = ensure();
  const rating =
    input.rating == null ? null : Math.min(5, Math.max(1, Math.round(Number(input.rating))));
  const row: CustomerFeedback = {
    id: generateId(),
    category: input.category,
    rating,
    title: input.title.slice(0, 200),
    comment: input.comment.slice(0, 5000),
    submitterEmail: input.submitterEmail ?? null,
    submitterRole: input.submitterRole ?? null,
    linkedFeatureId: null,
    linkedBugId: null,
    status: "new",
    createdAt: now(),
    updatedAt: now(),
  };
  db.feedback.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateFeedback(
  id: string,
  patch: Partial<Pick<CustomerFeedback, "status" | "linkedFeatureId" | "linkedBugId">>,
): CustomerFeedback {
  const db = ensure();
  const row = db.feedback.find((r) => r.id === id);
  if (!row) throw new Error("Feedback not found");
  Object.assign(row, patch);
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

export function getFeedbackMonthlySummary(monthKey?: string) {
  const key =
    monthKey ??
    (() => {
      const d = new Date();
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    })();
  const rows = listFeedback().filter((f) => f.createdAt.startsWith(key));
  const ratings = rows.map((r) => r.rating).filter((n): n is number => typeof n === "number");
  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }
  return {
    month: key,
    total: rows.length,
    averageRating: ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null,
    byCategory,
    newCount: rows.filter((r) => r.status === "new").length,
    actionedCount: rows.filter((r) => r.status === "actioned").length,
    samples: rows.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      rating: r.rating,
      status: r.status,
    })),
  };
}

/* ─── Continuous optimization ─────────────────────────── */

export function listOptimizationNotes(status?: OptimizationNote["status"] | "all") {
  let rows = [...ensure().optimizationNotes];
  if (status && status !== "all") rows = rows.filter((r) => r.status === status);
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createOptimizationNote(input: {
  area: OptimizationNote["area"];
  title: string;
  finding: string;
  recommendedAction: string;
  status?: OptimizationNote["status"];
}): OptimizationNote {
  const db = ensure();
  const row: OptimizationNote = {
    id: generateId(),
    area: input.area,
    title: input.title.slice(0, 200),
    finding: input.finding.slice(0, 2000),
    recommendedAction: input.recommendedAction.slice(0, 2000),
    status: input.status ?? "open",
    createdAt: now(),
    updatedAt: now(),
  };
  db.optimizationNotes.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateOptimizationNote(
  id: string,
  patch: Partial<Pick<OptimizationNote, "status" | "recommendedAction" | "finding" | "title">>,
): OptimizationNote {
  const db = ensure();
  const row = db.optimizationNotes.find((r) => r.id === id);
  if (!row) throw new Error("Optimization note not found");
  Object.assign(row, patch);
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Maintenance / ops dashboard (Task 021) ──────────── */

function maintenancePublicStatus() {
  const settings = getPlatformSettings();
  const envOn = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const settingsOn = isMaintenanceMode() || settings.general.platformStatus === "maintenance";
  const enabled = envOn || settingsOn;
  const latest = ensure().maintenanceLogs[0];
  return {
    enabled,
    statusMessage:
      latest?.statusMessage ||
      settings.general.footerText ||
      "ATPL PASS is undergoing scheduled maintenance. Please check again shortly.",
    estimatedReturnAt: latest?.estimatedReturnAt ?? null,
    contactEmail:
      latest?.contactEmail || settings.general.supportEmail || settings.general.contactEmail,
    contactPhone: latest?.contactPhone || settings.general.contactPhone || "",
    platformName: settings.general.platformName,
  };
}

export function getMaintenanceDashboard() {
  const db = ensure();
  const supportOpen = db.supportRequests.filter((r) => !["resolved", "closed"].includes(r.status));
  const bugsOpen = db.bugs.filter((b) => !["verified", "closed"].includes(b.status));
  const incidentsOpen = db.incidents.filter((i) => !["resolved", "closed"].includes(i.status));
  const releases = [...db.releases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const maintenance = maintenancePublicStatus();
  const hypercare = getHypercare();
  const feedbackSummary = getFeedbackMonthlySummary();

  const resolvedSupport = db.supportRequests.filter((r) => r.resolvedAt);
  const avgResolutionHours =
    resolvedSupport.length === 0
      ? null
      : Math.round(
          (resolvedSupport.reduce((sum, r) => {
            const ms = new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime();
            return sum + ms / 3600_000;
          }, 0) /
            resolvedSupport.length) *
            10,
        ) / 10;

  const availability = maintenance.enabled
    ? "maintenance"
    : hypercare.enabled && hypercare.checkIns[0]?.stability === "critical"
      ? "degraded"
      : "available";

  return {
    systemHealth: availability === "available" ? "healthy" : availability,
    availability,
    openIssues: {
      support: supportOpen.length,
      bugs: bugsOpen.length,
      incidents: incidentsOpen.length,
      featuresPending: db.featureRequests.filter((f) => f.approvalStatus === "pending").length,
      alerts: db.alerts.filter((a) => a.status === "open").length,
    },
    recentReleases: releases.slice(0, 5),
    upcomingMaintenance: {
      enabled: maintenance.enabled,
      statusMessage: maintenance.statusMessage,
      estimatedReturnAt: maintenance.estimatedReturnAt,
      recentLogs: db.maintenanceLogs.slice(0, 5),
    },
    supportMetrics: {
      openSupport: supportOpen.length,
      slaBreaches: db.supportRequests.filter((r) => r.slaBreached).length,
      avgResolutionHours,
      feedbackMonth: feedbackSummary,
    },
    hypercare: {
      enabled: hypercare.enabled,
      label: hypercare.label,
      endsAt: hypercare.endsAt,
      latestCheckIn: hypercare.checkIns[0] ?? null,
      watchModules: hypercare.watchModules,
    },
    sla: db.sla ?? DEFAULT_SLA,
    optimizationOpen: db.optimizationNotes.filter((n) => n.status !== "done").length,
    knowledgePublished: db.knowledgeArticles.filter((a) => a.published).length,
    timestamp: now(),
  };
}

export type { DevelopmentStatus, FeatureApprovalStatus };

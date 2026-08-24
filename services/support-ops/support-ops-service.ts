/**
 * Support-ops domain services — SLA, bugs, CRs, releases, roadmap, alerts.
 */

import { generateId } from "@/lib/security/crypto";
import { getHealthSnapshot } from "@/services/ops/health-service";
import { listBackups, testRestore } from "@/services/ops/backup-service";
import { listOpsLogs, writeOpsLog } from "@/services/ops/logging-service";
import { getActivityMonitoring } from "@/services/settings/monitoring";
import { getPlatformSettings, isMaintenanceMode } from "@/services/settings/settings-service";
import { ensureSupportOpsSeeded } from "@/services/support-ops/seed";
import {
  nextNumber,
  writeSupportOpsStore,
  DEFAULT_SLA,
} from "@/services/support-ops/store";
import type {
  AlertStatus,
  BackupVerificationReport,
  BugReport,
  BugStatus,
  ChangeRequest,
  IncidentReport,
  MaintenanceLog,
  OpsAlert,
  ReleaseNote,
  RoadmapItem,
  RoadmapStatus,
  SlaPolicy,
  SupportPriority,
  SupportRequest,
  SupportRequestStatus,
  SystemHealthLog,
} from "@/types/support-ops";

function now() {
  return new Date().toISOString();
}

function ensure() {
  return ensureSupportOpsSeeded();
}

/* ─── SLA ─────────────────────────────────────────────── */

export function getSlaPolicy(): SlaPolicy {
  return ensure().sla;
}

export function updateSlaPolicy(
  patch: Partial<Omit<SlaPolicy, "updatedAt" | "updatedBy">>,
  actorId: string | null,
): SlaPolicy {
  const db = ensure();
  db.sla = {
    ...db.sla,
    ...patch,
    critical: { ...db.sla.critical, ...(patch.critical ?? {}) },
    high: { ...db.sla.high, ...(patch.high ?? {}) },
    medium: { ...db.sla.medium, ...(patch.medium ?? {}) },
    low: { ...db.sla.low, ...(patch.low ?? {}) },
    updatedAt: now(),
    updatedBy: actorId,
  };
  writeSupportOpsStore(db);
  writeOpsLog({
    level: "info",
    category: "audit",
    message: "SLA policy updated",
    userId: actorId,
  });
  return db.sla;
}

export function evaluateSlaBreach(priority: SupportPriority, createdAt: string, firstResponseAt: string | null) {
  const sla = getSlaPolicy()[priority];
  const created = new Date(createdAt).getTime();
  const deadline = created + sla.responseHours * 3600_000;
  if (!firstResponseAt) return Date.now() > deadline;
  return new Date(firstResponseAt).getTime() > deadline;
}

/* ─── Support requests ────────────────────────────────── */

export function listSupportRequests(filters?: {
  status?: SupportRequestStatus | "all";
  priority?: SupportPriority | "all";
  category?: string;
  q?: string;
}) {
  let rows = [...ensure().supportRequests];
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    rows = rows.filter((r) => r.priority === filters.priority);
  }
  if (filters?.category && filters.category !== "all") {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.subject.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        r.requesterEmail.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createSupportRequest(input: {
  subject: string;
  description: string;
  category: SupportRequest["category"];
  channel: SupportRequest["channel"];
  priority: SupportPriority;
  requesterEmail: string;
  requesterName: string;
  actorId?: string | null;
}): SupportRequest {
  const db = ensure();
  const number = nextNumber(db, "SUP", "support");
  const row: SupportRequest = {
    id: generateId(),
    number,
    subject: input.subject.slice(0, 200),
    description: input.description.slice(0, 5000),
    category: input.category,
    channel: input.channel,
    priority: input.priority,
    status: "new",
    requesterEmail: input.requesterEmail,
    requesterName: input.requesterName,
    assigneeId: null,
    firstResponseAt: null,
    resolvedAt: null,
    slaBreached: false,
    linkedTicketId: null,
    createdAt: now(),
    updatedAt: now(),
    history: [{ at: now(), actorId: input.actorId ?? null, note: "Created" }],
  };
  db.supportRequests.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateSupportRequest(
  id: string,
  patch: Partial<Pick<SupportRequest, "status" | "priority" | "assigneeId">> & { note?: string },
  actorId: string | null,
): SupportRequest {
  const db = ensure();
  const row = db.supportRequests.find((r) => r.id === id);
  if (!row) throw new Error("Support request not found");
  if (patch.status) {
    row.history.push({
      at: now(),
      actorId,
      note: patch.note ?? `Status → ${patch.status}`,
    });
    row.status = patch.status;
    if (patch.status === "acknowledged" || patch.status === "in_progress") {
      if (!row.firstResponseAt) row.firstResponseAt = now();
    }
    if (patch.status === "resolved" || patch.status === "closed") {
      row.resolvedAt = row.resolvedAt ?? now();
    }
  }
  if (patch.priority) row.priority = patch.priority;
  if (patch.assigneeId !== undefined) row.assigneeId = patch.assigneeId;
  row.slaBreached = evaluateSlaBreach(row.priority, row.createdAt, row.firstResponseAt);
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Bugs ────────────────────────────────────────────── */

export function listBugs(filters?: { status?: BugStatus | "all"; priority?: SupportPriority | "all"; q?: string }) {
  let rows = [...ensure().bugs];
  if (filters?.status && filters.status !== "all") rows = rows.filter((r) => r.status === filters.status);
  if (filters?.priority && filters.priority !== "all") {
    rows = rows.filter((r) => r.priority === filters.priority);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        r.module.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createBug(input: {
  title: string;
  description: string;
  priority: SupportPriority;
  module: string;
  reporterId?: string | null;
}): BugReport {
  const db = ensure();
  const number = nextNumber(db, "BUG", "bug");
  const row: BugReport = {
    id: generateId(),
    number,
    title: input.title.slice(0, 200),
    description: input.description.slice(0, 5000),
    priority: input.priority,
    status: "new",
    module: input.module,
    reporterId: input.reporterId ?? null,
    assigneeId: null,
    resolution: null,
    verifiedAt: null,
    closedAt: null,
    createdAt: now(),
    updatedAt: now(),
    history: [{ at: now(), actorId: input.reporterId ?? null, note: "Opened" }],
  };
  db.bugs.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateBug(
  id: string,
  patch: Partial<Pick<BugReport, "status" | "priority" | "assigneeId" | "resolution">> & {
    note?: string;
  },
  actorId: string | null,
): BugReport {
  const db = ensure();
  const row = db.bugs.find((r) => r.id === id);
  if (!row) throw new Error("Bug not found");
  if (patch.status && patch.status !== row.status) {
    row.history.push({
      at: now(),
      actorId,
      from: row.status,
      to: patch.status,
      note: patch.note ?? `Status → ${patch.status}`,
    });
    row.status = patch.status;
    if (patch.status === "verified") row.verifiedAt = now();
    if (patch.status === "closed") row.closedAt = now();
  }
  if (patch.priority) row.priority = patch.priority;
  if (patch.assigneeId !== undefined) row.assigneeId = patch.assigneeId;
  if (patch.resolution !== undefined) row.resolution = patch.resolution;
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Change requests ─────────────────────────────────── */

export function listChangeRequests() {
  return [...ensure().changeRequests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createChangeRequest(input: {
  description: string;
  businessImpact: string;
  estimatedTimeHours?: number | null;
  estimatedCost?: number | null;
  currency?: string;
  requestedBy?: string | null;
  futurePhase?: string | null;
}): ChangeRequest {
  const db = ensure();
  const number = nextNumber(db, "CR", "cr");
  const row: ChangeRequest = {
    id: generateId(),
    number,
    description: input.description.slice(0, 5000),
    businessImpact: input.businessImpact.slice(0, 2000),
    estimatedTimeHours: input.estimatedTimeHours ?? null,
    estimatedCost: input.estimatedCost ?? null,
    currency: input.currency ?? "USD",
    approvalStatus: "pending",
    developmentStatus: "not_started",
    requestedBy: input.requestedBy ?? null,
    approvedBy: null,
    futurePhase: input.futurePhase ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.changeRequests.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateChangeRequest(
  id: string,
  patch: Partial<
    Pick<
      ChangeRequest,
      "approvalStatus" | "developmentStatus" | "estimatedTimeHours" | "estimatedCost" | "futurePhase"
    >
  >,
  actorId: string | null,
): ChangeRequest {
  const db = ensure();
  const row = db.changeRequests.find((r) => r.id === id);
  if (!row) throw new Error("Change request not found");
  Object.assign(row, patch);
  if (patch.approvalStatus === "approved") {
    row.approvedBy = actorId;
    if (row.developmentStatus === "not_started") row.developmentStatus = "planned";
    // Promote to roadmap when approved
    const exists = db.roadmapItems.some((r) => r.changeRequestId === row.id);
    if (!exists) {
      db.roadmapItems.unshift({
        id: generateId(),
        title: row.description.slice(0, 120),
        description: row.businessImpact,
        status: "approved",
        priority: "medium",
        targetVersion: row.futurePhase,
        changeRequestId: row.id,
        createdAt: now(),
        updatedAt: now(),
      });
    }
  }
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Releases ────────────────────────────────────────── */

export function listReleases() {
  return [...ensure().releases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createRelease(input: {
  version: string;
  title: string;
  summary: string;
  highlights?: string[];
  fixes?: string[];
  breakingChanges?: string[];
  deployedAt?: string | null;
  createdBy?: string | null;
}): ReleaseNote {
  const db = ensure();
  if (db.releases.some((r) => r.version === input.version)) {
    throw new Error(`Release ${input.version} already exists`);
  }
  const row: ReleaseNote = {
    id: generateId(),
    version: input.version.trim(),
    title: input.title.slice(0, 200),
    summary: input.summary.slice(0, 2000),
    highlights: input.highlights ?? [],
    fixes: input.fixes ?? [],
    breakingChanges: input.breakingChanges ?? [],
    deployedAt: input.deployedAt ?? null,
    createdBy: input.createdBy ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.releases.unshift(row);
  writeSupportOpsStore(db);
  writeOpsLog({
    level: "info",
    category: "application",
    message: `Release ${row.version} recorded`,
    userId: input.createdBy,
  });
  return row;
}

export function markReleaseDeployed(id: string, deployedAt?: string): ReleaseNote {
  const db = ensure();
  const row = db.releases.find((r) => r.id === id);
  if (!row) throw new Error("Release not found");
  row.deployedAt = deployedAt ?? now();
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Maintenance logs ────────────────────────────────── */

export function getMaintenancePublicStatus() {
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
    contactEmail: latest?.contactEmail || settings.general.supportEmail || settings.general.contactEmail,
    contactPhone: latest?.contactPhone || settings.general.contactPhone || "",
    platformName: settings.general.platformName,
  };
}

export function logMaintenanceChange(input: {
  enabled: boolean;
  statusMessage: string;
  estimatedReturnAt?: string | null;
  contactEmail?: string;
  contactPhone?: string;
  actorId?: string | null;
}): MaintenanceLog {
  const db = ensure();
  const settings = getPlatformSettings();
  const row: MaintenanceLog = {
    id: generateId(),
    enabled: input.enabled,
    statusMessage: input.statusMessage.slice(0, 1000),
    estimatedReturnAt: input.estimatedReturnAt ?? null,
    contactEmail: input.contactEmail || settings.general.supportEmail,
    contactPhone: input.contactPhone || settings.general.contactPhone || "",
    actorId: input.actorId ?? null,
    createdAt: now(),
  };
  db.maintenanceLogs.unshift(row);
  if (db.maintenanceLogs.length > 200) db.maintenanceLogs = db.maintenanceLogs.slice(0, 200);
  writeSupportOpsStore(db);
  writeOpsLog({
    level: "warn",
    category: "application",
    message: input.enabled ? "Maintenance mode enabled" : "Maintenance mode disabled",
    userId: input.actorId,
  });
  return row;
}

export function listMaintenanceLogs(limit = 50) {
  return ensure().maintenanceLogs.slice(0, limit);
}

/* ─── Incidents ───────────────────────────────────────── */

export function listIncidents() {
  return [...ensure().incidents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createIncident(input: {
  title: string;
  summary: string;
  severity: SupportPriority;
  affectedServices?: string[];
  createdBy?: string | null;
}): IncidentReport {
  const db = ensure();
  const number = nextNumber(db, "INC", "incident");
  const row: IncidentReport = {
    id: generateId(),
    number,
    title: input.title.slice(0, 200),
    summary: input.summary.slice(0, 5000),
    severity: input.severity,
    status: "open",
    affectedServices: input.affectedServices ?? [],
    startedAt: now(),
    resolvedAt: null,
    postmortem: null,
    createdBy: input.createdBy ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.incidents.unshift(row);
  // Critical incidents raise alerts
  if (row.severity === "critical" || row.severity === "high") {
    db.alerts.unshift({
      id: generateId(),
      severity: row.severity,
      status: "open",
      source: "incident",
      title: `${row.number}: ${row.title}`,
      detail: row.summary.slice(0, 500),
      createdAt: now(),
      acknowledgedAt: null,
      resolvedAt: null,
    });
  }
  writeSupportOpsStore(db);
  writeOpsLog({
    level: row.severity === "critical" ? "error" : "warn",
    category: "security",
    message: `Incident ${row.number} opened`,
    userId: input.createdBy,
  });
  return row;
}

export function updateIncident(
  id: string,
  patch: Partial<Pick<IncidentReport, "status" | "postmortem" | "summary">>,
): IncidentReport {
  const db = ensure();
  const row = db.incidents.find((r) => r.id === id);
  if (!row) throw new Error("Incident not found");
  Object.assign(row, patch);
  if (patch.status === "resolved" || patch.status === "closed") {
    row.resolvedAt = row.resolvedAt ?? now();
  }
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Roadmap ─────────────────────────────────────────── */

export function listRoadmapItems(status?: RoadmapStatus | "all") {
  let rows = [...ensure().roadmapItems];
  if (status && status !== "all") rows = rows.filter((r) => r.status === status);
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createRoadmapItem(input: {
  title: string;
  description: string;
  status?: RoadmapStatus;
  priority?: SupportPriority;
  targetVersion?: string | null;
}): RoadmapItem {
  const db = ensure();
  const row: RoadmapItem = {
    id: generateId(),
    title: input.title.slice(0, 200),
    description: input.description.slice(0, 2000),
    status: input.status ?? "planned",
    priority: input.priority ?? "medium",
    targetVersion: input.targetVersion ?? null,
    changeRequestId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.roadmapItems.unshift(row);
  writeSupportOpsStore(db);
  return row;
}

export function updateRoadmapItem(
  id: string,
  patch: Partial<Pick<RoadmapItem, "status" | "priority" | "targetVersion" | "title" | "description">>,
): RoadmapItem {
  const db = ensure();
  const row = db.roadmapItems.find((r) => r.id === id);
  if (!row) throw new Error("Roadmap item not found");
  Object.assign(row, patch);
  row.updatedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/* ─── Alerts & health dashboard ───────────────────────── */

export function listAlerts(status?: AlertStatus | "all") {
  let rows = [...ensure().alerts];
  if (status && status !== "all") rows = rows.filter((a) => a.status === status);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function acknowledgeAlert(id: string): OpsAlert {
  const db = ensure();
  const row = db.alerts.find((a) => a.id === id);
  if (!row) throw new Error("Alert not found");
  row.status = "acknowledged";
  row.acknowledgedAt = now();
  writeSupportOpsStore(db);
  return row;
}

export function resolveAlert(id: string): OpsAlert {
  const db = ensure();
  const row = db.alerts.find((a) => a.id === id);
  if (!row) throw new Error("Alert not found");
  row.status = "resolved";
  row.resolvedAt = now();
  writeSupportOpsStore(db);
  return row;
}

/** Evaluate health and raise alerts for critical failures. */
export function evaluateHealthAlerts(): OpsAlert[] {
  const health = getHealthSnapshot({ deep: true });
  const db = ensure();
  const raised: OpsAlert[] = [];
  for (const check of health.checks) {
    if (check.status !== "fail") continue;
    const existing = db.alerts.find(
      (a) => a.source === `health:${check.id}` && a.status !== "resolved",
    );
    if (existing) continue;
    const alert: OpsAlert = {
      id: generateId(),
      severity: "critical",
      status: "open",
      source: `health:${check.id}`,
      title: `Health check failed: ${check.label}`,
      detail: check.detail,
      createdAt: now(),
      acknowledgedAt: null,
      resolvedAt: null,
    };
    db.alerts.unshift(alert);
    raised.push(alert);
    writeOpsLog({
      level: "error",
      category: "error",
      message: alert.title,
      details: { detail: check.detail },
    });
  }
  if (raised.length) writeSupportOpsStore(db);
  return raised;
}

export function captureHealthLog(): SystemHealthLog {
  const health = getHealthSnapshot({ deep: true });
  const mon = getActivityMonitoring();
  const errors = listOpsLogs({ category: "error", limit: 100 });
  const openAlerts = listAlerts("open");
  evaluateHealthAlerts();
  const db = ensure();
  const row: SystemHealthLog = {
    id: generateId(),
    status: health.status,
    checks: health.checks.map((c) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      detail: c.detail,
    })),
    activeUsers: mon.onlineUsers,
    errorCount: errors.length,
    securityAlertCount: openAlerts.filter((a) => a.severity === "critical" || a.severity === "high")
      .length,
    capturedAt: now(),
  };
  db.healthLogs.unshift(row);
  if (db.healthLogs.length > 200) db.healthLogs = db.healthLogs.slice(0, 200);
  writeSupportOpsStore(db);
  return row;
}

export function listHealthLogs(limit = 50) {
  return ensure().healthLogs.slice(0, limit);
}

export function getSystemHealthDashboard() {
  const health = getHealthSnapshot({ deep: true });
  const mon = getActivityMonitoring();
  const errors = listOpsLogs({ category: "error", limit: 50 });
  const security = listOpsLogs({ category: "security", limit: 20 });
  const backups = listBackups();
  const openAlerts = listAlerts("open");
  const settings = getPlatformSettings();

  const queueHealth =
    settings.email.smtpHost || settings.email.provider !== "smtp" ? "healthy" : "degraded";

  return {
    serverStatus: health.status === "ok" || health.status === "ok_with_warnings" ? "up" : "degraded",
    databaseStatus: health.checks.find((c) => c.id === "database")?.status ?? "warn",
    apiStatus: "pass" as const,
    storage: mon.storageUsage,
    queueHealth,
    activeUsers: mon.onlineUsers,
    errorCount: errors.length,
    securityAlerts: security.slice(0, 10),
    openAlerts,
    checks: health.checks,
    backups: {
      total: backups.length,
      latest: backups[0] ?? null,
      dailyOk: backups.some((b) => b.retention === "daily"),
      weeklyOk: backups.some((b) => b.retention === "weekly"),
      restoreTested: backups.some((b) => Boolean(b.restoreTestedAt)),
    },
    maintenance: getMaintenancePublicStatus(),
    sla: getSlaPolicy(),
    timestamp: now(),
  };
}

/* ─── Backup verification reports ─────────────────────── */

export function generateBackupReport(input?: {
  period?: BackupVerificationReport["period"];
  backupId?: string;
  generatedBy?: string | null;
  runRestoreTest?: boolean;
}): BackupVerificationReport {
  const backups = listBackups();
  const target = input?.backupId
    ? backups.find((b) => b.id === input.backupId) ?? null
    : backups[0] ?? null;
  let restoreTestOk: boolean | null = null;
  if (input?.runRestoreTest && target) {
    const result = testRestore(target.id);
    restoreTestOk = Boolean(result.ok);
  } else if (target?.restoreTestedAt) {
    restoreTestOk = true;
  }
  const integrityOk = Boolean(target && target.files?.length);
  const row: BackupVerificationReport = {
    id: generateId(),
    period: input?.period ?? "ad_hoc",
    backupId: target?.id ?? null,
    success: Boolean(target),
    integrityOk,
    restoreTestOk,
    notes: target
      ? `Verified backup ${target.id} (${target.retention})`
      : "No backup available",
    generatedAt: now(),
    generatedBy: input?.generatedBy ?? null,
  };
  const db = ensure();
  db.backupReports.unshift(row);
  if (db.backupReports.length > 100) db.backupReports = db.backupReports.slice(0, 100);
  writeSupportOpsStore(db);
  writeOpsLog({
    level: row.success && row.integrityOk ? "info" : "warn",
    category: "backup",
    message: `Backup verification report ${row.id}`,
    details: { backupId: row.backupId, success: row.success },
    userId: input?.generatedBy,
  });
  return row;
}

export function listBackupReports(limit = 50) {
  return ensure().backupReports.slice(0, limit);
}

export function getSupportOpsSummary() {
  const db = ensure();
  return {
    openSupport: db.supportRequests.filter((r) => !["resolved", "closed"].includes(r.status)).length,
    openBugs: db.bugs.filter((r) => !["verified", "closed"].includes(r.status)).length,
    pendingCrs: db.changeRequests.filter((r) => r.approvalStatus === "pending").length,
    openIncidents: db.incidents.filter((r) => !["resolved", "closed"].includes(r.status)).length,
    openAlerts: db.alerts.filter((a) => a.status === "open").length,
    releases: db.releases.length,
    roadmapActive: db.roadmapItems.filter((r) =>
      ["planned", "approved", "in_development"].includes(r.status),
    ).length,
    sla: db.sla ?? DEFAULT_SLA,
  };
}

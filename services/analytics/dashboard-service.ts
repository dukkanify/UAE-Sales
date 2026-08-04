/**
 * Dashboard prefs, saved reports, scheduled reports.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertScopeAccess,
  canScheduleReports,
  AnalyticsError,
} from "@/services/analytics/access";
import { readAnalyticsDb, writeAnalyticsDb } from "@/services/analytics/store";
import type {
  AnalyticsFilters,
  AnalyticsScope,
  DashboardWidget,
  ReportFrequency,
  SavedReport,
  ScheduledReport,
  UserDashboardPrefs,
} from "@/types/analytics";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "kpi_students", scope: "executive", title: "Students KPI", kind: "kpi", kpiIds: ["total_students", "active_students"], order: 1, visible: true, pinned: true },
  { id: "chart_revenue", scope: "executive", title: "Revenue trend", kind: "chart", chartId: "revenue_monthly", order: 2, visible: true, pinned: true },
  { id: "chart_growth", scope: "executive", title: "Student growth", kind: "chart", chartId: "student_growth", order: 3, visible: true, pinned: false },
  { id: "chart_enroll", scope: "learning", title: "Enrollments", kind: "chart", chartId: "course_completion", order: 4, visible: true, pinned: false },
  { id: "kpi_finance", scope: "financial", title: "Finance KPIs", kind: "kpi", kpiIds: ["revenue", "monthly"], order: 5, visible: true, pinned: true },
];

export function getDashboardPrefs(user: UserProfile): UserDashboardPrefs {
  const existing = readAnalyticsDb().prefs.find((p) => p.userId === user.id);
  if (existing) return existing;
  const prefs: UserDashboardPrefs = {
    userId: user.id,
    widgets: DEFAULT_WIDGETS.map((w) => ({ ...w })),
    savedFilters: [],
    favoriteDashboardIds: ["executive"],
    updatedAt: nowIso(),
  };
  writeAnalyticsDb((db) => {
    db.prefs.push(prefs);
  });
  return prefs;
}

export function updateDashboardPrefs(
  user: UserProfile,
  patch: Partial<Pick<UserDashboardPrefs, "widgets" | "savedFilters" | "favoriteDashboardIds">>,
): UserDashboardPrefs {
  getDashboardPrefs(user);
  writeAnalyticsDb((db) => {
    const row = db.prefs.find((p) => p.userId === user.id);
    if (!row) return;
    if (patch.widgets) row.widgets = patch.widgets;
    if (patch.savedFilters) row.savedFilters = patch.savedFilters;
    if (patch.favoriteDashboardIds) row.favoriteDashboardIds = patch.favoriteDashboardIds;
    row.updatedAt = nowIso();
  });
  void logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.ANALYTICS_DASHBOARD_UPDATED,
    entityType: "dashboard_prefs",
    entityId: user.id,
  });
  return getDashboardPrefs(user);
}

export function toggleWidgetVisibility(user: UserProfile, widgetId: string, visible?: boolean) {
  const prefs = getDashboardPrefs(user);
  const widgets = prefs.widgets.map((w) =>
    w.id === widgetId ? { ...w, visible: visible ?? !w.visible } : w,
  );
  return updateDashboardPrefs(user, { widgets });
}

export function reorderWidgets(user: UserProfile, orderedIds: string[]) {
  const prefs = getDashboardPrefs(user);
  const map = new Map(prefs.widgets.map((w) => [w.id, w]));
  const widgets = orderedIds
    .map((id, index) => {
      const w = map.get(id);
      if (!w) return null;
      return { ...w, order: index + 1 };
    })
    .filter(Boolean) as DashboardWidget[];
  for (const w of prefs.widgets) {
    if (!orderedIds.includes(w.id)) widgets.push(w);
  }
  return updateDashboardPrefs(user, { widgets });
}

export function pinSavedReport(user: UserProfile, reportId: string, pinned = true) {
  writeAnalyticsDb((db) => {
    const row = db.savedReports.find((r) => r.id === reportId && r.createdById === user.id);
    if (row) {
      row.pinned = pinned;
      row.updatedAt = nowIso();
    }
  });
  return listSavedReports(user);
}

export function listSavedReports(user: UserProfile): SavedReport[] {
  return readAnalyticsDb()
    .savedReports.filter((r) => r.createdById === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveReport(input: {
  user: UserProfile;
  name: string;
  scope: AnalyticsScope;
  filters: AnalyticsFilters;
  pinned?: boolean;
}): Promise<SavedReport> {
  assertScopeAccess(input.user, input.scope);
  const stamp = nowIso();
  const report: SavedReport = {
    id: generateId(),
    name: input.name.trim(),
    scope: input.scope,
    filters: input.filters,
    createdById: input.user.id,
    pinned: Boolean(input.pinned),
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeAnalyticsDb((db) => {
    db.savedReports.unshift(report);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ANALYTICS_REPORT_SAVED,
    entityType: "saved_report",
    entityId: report.id,
  });
  return report;
}

export function listScheduledReports(): ScheduledReport[] {
  return [...readAnalyticsDb().scheduledReports].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function scheduleReport(input: {
  user: UserProfile;
  name: string;
  scope: AnalyticsScope;
  frequency: ReportFrequency;
  recipients: string[];
  filters?: AnalyticsFilters;
}): Promise<ScheduledReport> {
  if (!canScheduleReports(input.user)) {
    throw new AnalyticsError("Only Super Admin can schedule reports", 403);
  }
  assertScopeAccess(input.user, input.scope);
  const stamp = nowIso();
  const next = nextRunFor(input.frequency);
  const row: ScheduledReport = {
    id: generateId(),
    name: input.name.trim(),
    scope: input.scope,
    frequency: input.frequency,
    recipients: input.recipients,
    filters: input.filters ?? {},
    enabled: true,
    createdById: input.user.id,
    lastRunAt: null,
    nextRunAt: next,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeAnalyticsDb((db) => {
    db.scheduledReports.unshift(row);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ANALYTICS_REPORT_SCHEDULED,
    entityType: "scheduled_report",
    entityId: row.id,
  });
  return row;
}

export function runDueScheduledReports(): number {
  const now = nowIso();
  let ran = 0;
  writeAnalyticsDb((db) => {
    for (const row of db.scheduledReports) {
      if (!row.enabled || !row.nextRunAt || row.nextRunAt > now) continue;
      row.lastRunAt = now;
      row.nextRunAt = nextRunFor(row.frequency);
      row.updatedAt = now;
      db.reportHistory.unshift({
        id: generateId(),
        reportName: row.name,
        scope: row.scope,
        format: "csv",
        generatedById: row.createdById,
        filters: row.filters,
        rowCount: 0,
        createdAt: now,
      });
      ran += 1;
    }
  });
  return ran;
}

function nextRunFor(frequency: ReportFrequency): string {
  const d = new Date();
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "quarterly") d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export function listReportHistory(limit = 50) {
  return [...readAnalyticsDb().reportHistory]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

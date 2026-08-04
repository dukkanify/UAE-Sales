/**
 * Report assembly + scheduling orchestration.
 */

import type { AnalyticsFilters, AnalyticsScope } from "@/types/analytics";
import type { UserProfile } from "@/types";
import { resolveScopeAnalytics } from "@/services/analytics/kpi-service";
import { resolveCharts } from "@/services/analytics/chart-service";
import {
  exportAnalyticsCsv,
  renderAnalyticsPrintHtml,
} from "@/services/analytics/export-service";
import {
  getDashboardPrefs,
  listReportHistory,
  listSavedReports,
  listScheduledReports,
  runDueScheduledReports,
  saveReport,
  scheduleReport,
  updateDashboardPrefs,
} from "@/services/analytics/dashboard-service";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";

export type ReportBundle = {
  scope: AnalyticsScope;
  filters: AnalyticsFilters;
  generatedAt: string;
  snapshot: unknown;
  charts: ReturnType<typeof resolveCharts>;
};

export function buildReportBundle(
  user: UserProfile,
  scope: AnalyticsScope,
  filters: AnalyticsFilters = {},
): ReportBundle {
  ensureAnalyticsSeeded();
  return {
    scope,
    filters,
    generatedAt: new Date().toISOString(),
    snapshot: resolveScopeAnalytics(user, scope, filters),
    charts: resolveCharts(user, scope, filters),
  };
}

export function exportReport(
  user: UserProfile,
  scope: AnalyticsScope,
  format: "csv" | "pdf" | "xlsx" | "print",
  filters?: AnalyticsFilters,
): { content: string; contentType: string; filename: string } {
  if (format === "csv" || format === "xlsx") {
    const csv = exportAnalyticsCsv(user, scope, filters);
    return {
      content: csv,
      contentType:
        format === "xlsx"
          ? "application/vnd.ms-excel; charset=utf-8"
          : "text/csv; charset=utf-8",
      filename: `aep-${scope}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xls" : "csv"}`,
    };
  }
  const html = renderAnalyticsPrintHtml(user, scope, filters);
  return {
    content: html,
    contentType: "text/html; charset=utf-8",
    filename: `aep-${scope}-report.html`,
  };
}

export {
  getDashboardPrefs,
  listReportHistory,
  listSavedReports,
  listScheduledReports,
  runDueScheduledReports,
  saveReport,
  scheduleReport,
  updateDashboardPrefs,
};

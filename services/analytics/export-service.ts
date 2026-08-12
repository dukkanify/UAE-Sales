/**
 * Analytics export + report history.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { assertScopeAccess } from "@/services/analytics/access";
import {
  buildCommunityAnalytics,
  buildExecutiveAnalytics,
  buildFinancialAnalytics,
  buildLearningAnalytics,
  buildLiveClassAnalytics,
  buildPlatformHealthAnalytics,
  buildSupportAnalytics,
  buildInstructorAnalytics,
  buildStudentAnalytics,
} from "@/services/analytics/aggregator";
import { writeAnalyticsDb } from "@/services/analytics/store";
import type { AnalyticsFilters, AnalyticsScope } from "@/types/analytics";
import type { UserProfile } from "@/types";

export function exportAnalyticsCsv(
  user: UserProfile,
  scope: AnalyticsScope,
  filters?: AnalyticsFilters,
): string {
  assertScopeAccess(user, scope);
  const rows = flattenScope(user, scope, filters);
  void logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.ANALYTICS_EXPORTED,
    entityType: "analytics_export",
    entityId: scope,
    metadata: { format: "csv", rows: rows.length },
  });
  writeAnalyticsDb((db) => {
    db.reportHistory.unshift({
      id: generateId(),
      reportName: `${scope} export`,
      scope,
      format: "csv",
      generatedById: user.id,
      filters: filters ?? {},
      rowCount: rows.length,
      createdAt: new Date().toISOString(),
    });
  });
  return toCsv(["key", "value"], rows);
}

export function renderAnalyticsPrintHtml(
  user: UserProfile,
  scope: AnalyticsScope,
  filters?: AnalyticsFilters,
): string {
  assertScopeAccess(user, scope);
  const data = getScopePayload(user, scope, filters);
  const kpis = (data as { kpis?: Array<{ label: string; value: string | number }> }).kpis ?? [];
  const rows = kpis.map((k) => `<tr><td>${k.label}</td><td>${k.value}</td></tr>`).join("");
  writeAnalyticsDb((db) => {
    db.reportHistory.unshift({
      id: generateId(),
      reportName: `${scope} print`,
      scope,
      format: "print",
      generatedById: user.id,
      filters: filters ?? {},
      rowCount: kpis.length,
      createdAt: new Date().toISOString(),
    });
  });
  void logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.ANALYTICS_EXPORTED,
    entityType: "analytics_export",
    entityId: scope,
    metadata: { format: "pdf" },
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${scope} report</title>
<style>body{font-family:IBM Plex Sans,system-ui,sans-serif;padding:32px;color:#0B1A24}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left}h1{font-family:Exo 2,Arial,sans-serif;color:#143048}</style>
</head><body><h1>${scope.toUpperCase()} Report</h1><p>Generated ${new Date().toLocaleString()}</p>
<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=()=>setTimeout(()=>window.print(),200)</script></body></html>`;
}

function getScopePayload(user: UserProfile, scope: AnalyticsScope, filters?: AnalyticsFilters) {
  switch (scope) {
    case "executive":
      return buildExecutiveAnalytics(filters);
    case "learning":
    case "course":
      return buildLearningAnalytics(filters);
    case "financial":
      return buildFinancialAnalytics(filters);
    case "live":
      return buildLiveClassAnalytics(filters);
    case "community":
      return buildCommunityAnalytics();
    case "support":
      return buildSupportAnalytics();
    case "health":
      return buildPlatformHealthAnalytics();
    case "instructor":
      return buildInstructorAnalytics(filters?.instructorId ?? user.id, filters);
    case "student":
      return buildStudentAnalytics(user);
    default:
      return buildExecutiveAnalytics(filters);
  }
}

function flattenScope(
  user: UserProfile,
  scope: AnalyticsScope,
  filters?: AnalyticsFilters,
): string[][] {
  const data = getScopePayload(user, scope, filters) as {
    kpis?: Array<{ label: string; value: string | number }>;
  };
  return (data.kpis ?? []).map((k) => [k.label, String(k.value)]);
}

function toCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

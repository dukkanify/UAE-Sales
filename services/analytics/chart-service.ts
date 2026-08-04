/**
 * Chart service — extracts chart series from analytics snapshots.
 */

import type { AnalyticsFilters, AnalyticsScope, ChartSeries } from "@/types/analytics";
import type { UserProfile } from "@/types";
import { resolveScopeAnalytics } from "@/services/analytics/kpi-service";

export function resolveCharts(
  user: UserProfile,
  scope: AnalyticsScope,
  filters: AnalyticsFilters = {},
): ChartSeries[] {
  const payload = resolveScopeAnalytics(user, scope, filters) as {
    charts?: ChartSeries[];
  };
  return payload.charts ?? [];
}

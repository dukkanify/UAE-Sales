/**
 * Platform health / monitoring analytics facade.
 */

import { buildPlatformHealthAnalytics } from "@/services/analytics/aggregator";
import { getActivityMonitoring } from "@/services/settings/monitoring";

export function getHealthDashboard() {
  const bi = buildPlatformHealthAnalytics();
  const raw = getActivityMonitoring();
  return {
    ...bi,
    monitoring: raw,
  };
}

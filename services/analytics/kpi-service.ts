/**
 * KPI service — facade over aggregator snapshots (SOLID).
 */

import type { AnalyticsFilters, AnalyticsScope } from "@/types/analytics";
import type { UserProfile } from "@/types";
import { ROLES } from "@/constants/roles";
import {
  buildCommunityAnalytics,
  buildExecutiveAnalytics,
  buildFinancialAnalytics,
  buildInstructorAnalytics,
  buildLearningAnalytics,
  buildLiveClassAnalytics,
  buildPlatformHealthAnalytics,
  buildStudentAnalytics,
  buildSupportAnalytics,
} from "@/services/analytics/aggregator";
import { assertScopeAccess } from "@/services/analytics/access";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { getCached, setCached } from "@/services/analytics/cache-service";

export function resolveScopeAnalytics(
  user: UserProfile,
  scope: AnalyticsScope,
  filters: AnalyticsFilters = {},
) {
  ensureAnalyticsSeeded();
  assertScopeAccess(user, scope);

  const cacheKey = `kpi:${scope}:${user.id}:${JSON.stringify(filters)}`;
  const cached = getCached<unknown>(cacheKey);
  if (cached) return cached;

  let payload: unknown;
  switch (scope) {
    case "executive":
      payload = buildExecutiveAnalytics(filters);
      break;
    case "learning":
    case "course":
      payload = buildLearningAnalytics(filters);
      break;
    case "instructor": {
      const instructorId =
        filters.instructorId ??
        (user.role === ROLES.INSTRUCTOR || user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN
          ? filters.instructorId || user.id
          : user.id);
      payload = buildInstructorAnalytics(instructorId || user.id, filters);
      break;
    }
    case "student":
      payload = buildStudentAnalytics(user);
      break;
    case "financial":
      payload = buildFinancialAnalytics(filters);
      break;
    case "live":
      payload = buildLiveClassAnalytics(filters);
      break;
    case "community":
      payload = buildCommunityAnalytics();
      break;
    case "support":
      payload = buildSupportAnalytics();
      break;
    case "health":
      payload = buildPlatformHealthAnalytics();
      break;
    default:
      payload = buildExecutiveAnalytics(filters);
  }

  setCached(cacheKey, payload, 30);
  return payload;
}

export function listAvailableScopes(user: UserProfile): AnalyticsScope[] {
  const all: AnalyticsScope[] = [
    "executive",
    "learning",
    "course",
    "instructor",
    "student",
    "financial",
    "live",
    "community",
    "support",
    "health",
  ];
  return all.filter((scope) => {
    try {
      assertScopeAccess(user, scope);
      return true;
    } catch {
      return false;
    }
  });
}

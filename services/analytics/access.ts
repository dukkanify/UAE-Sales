/**
 * Analytics access helpers.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import type { UserProfile } from "@/types";
import type { AnalyticsScope } from "@/types/analytics";

export class AnalyticsError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AnalyticsError";
    this.status = status;
  }
}

export function canViewReports(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.REPORTS_VIEW) ||
    hasPermission(user.role, PERMISSIONS.REPORTS_OWN) ||
    user.role === ROLES.STUDENT
  );
}

export function canViewFinanceAnalytics(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.FINANCE_REPORTS) ||
    hasPermission(user.role, PERMISSIONS.SYSTEM_PAYMENTS)
  );
}

export function canViewHealth(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.AUDIT_READ);
}

export function canScheduleReports(user: UserProfile): boolean {
  return user.role === ROLES.SUPER_ADMIN || hasPermission(user.role, PERMISSIONS.SYSTEM_SETTINGS);
}

export function assertScopeAccess(user: UserProfile, scope: AnalyticsScope) {
  if (scope === "financial" && !canViewFinanceAnalytics(user)) {
    throw new AnalyticsError("Financial analytics restricted", 403);
  }
  if (scope === "health" && !canViewHealth(user)) {
    throw new AnalyticsError("Platform health restricted", 403);
  }
  if (scope === "executive" && !hasPermission(user.role, PERMISSIONS.REPORTS_VIEW) && user.role !== ROLES.SUPER_ADMIN) {
    throw new AnalyticsError("Executive analytics restricted", 403);
  }
  if (scope === "instructor" && user.role === ROLES.STUDENT) {
    throw new AnalyticsError("Instructor analytics restricted", 403);
  }
  if (!canViewReports(user) && scope !== "student") {
    throw new AnalyticsError("Analytics permission required", 403);
  }
}

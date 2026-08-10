/**
 * Application roles for RBAC.
 */

import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/constants/permissions";

export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  CHIEF_GROUND_INSTRUCTOR: "chief_ground_instructor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  instructor: "Instructor",
  chief_ground_instructor: "Chief Ground Instructor",
  admin: "Administrator",
  super_admin: "Super Administrator",
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  student: 1,
  instructor: 2,
  chief_ground_instructor: 3,
  admin: 4,
  super_admin: 5,
};

/** Default dashboard path per role */
export const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/student/dashboard",
  instructor: "/instructor/dashboard",
  chief_ground_instructor: "/cgi/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

/** Route prefix reserved for each role */
export const ROLE_ROUTE_PREFIX: Record<Role, string> = {
  student: "/student",
  instructor: "/instructor",
  chief_ground_instructor: "/cgi",
  admin: "/admin",
  super_admin: "/super-admin",
};

/** URL segment used in dashboard links (underscore roles → kebab/short paths). */
export function rolePathSegment(role: Role): string {
  if (role === ROLES.SUPER_ADMIN) return "super-admin";
  if (role === ROLES.CHIEF_GROUND_INSTRUCTOR) return "cgi";
  return role;
}

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export { PERMISSIONS };
export type { Permission };

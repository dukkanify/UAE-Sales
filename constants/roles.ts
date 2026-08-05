/**
 * Application roles for RBAC.
 */

import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/constants/permissions";

export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator",
  super_admin: "Super Administrator",
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  student: 1,
  instructor: 2,
  admin: 3,
  super_admin: 4,
};

/** Default dashboard path per role */
export const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/student/dashboard",
  instructor: "/instructor/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

/** Route prefix reserved for each role */
export const ROLE_ROUTE_PREFIX: Record<Role, string> = {
  student: "/student",
  instructor: "/instructor",
  admin: "/admin",
  super_admin: "/super-admin",
};

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export { PERMISSIONS };
export type { Permission };

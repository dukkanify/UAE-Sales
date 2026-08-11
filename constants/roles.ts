/**
 * Application roles for RBAC foundation.
 */

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

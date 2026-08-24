import { ROLE_PERMISSIONS, type Permission } from "@/constants/permissions";
import { ROLES, type Role } from "@/constants/roles";
import type { UserProfile } from "@/types";

export function getUserPermissions(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function assertPermission(
  user: UserProfile | null,
  permission: Permission,
): asserts user is UserProfile {
  if (!user) {
    throw new PermissionError("Authentication required", 401);
  }
  if (!hasPermission(user.role, permission)) {
    throw new PermissionError("You do not have permission to perform this action", 403);
  }
}

export class PermissionError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "PermissionError";
    this.status = status;
  }
}

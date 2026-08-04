import { ROLE_HIERARCHY, type Role } from "@/constants/roles";

/**
 * Check whether a user role meets the minimum required role level.
 */
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check whether a user role is exactly one of the allowed roles.
 */
export function hasRole(userRole: Role, allowed: Role[]): boolean {
  return allowed.includes(userRole);
}

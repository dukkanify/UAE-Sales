/**
 * Certificate access / validation helpers.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import type { UserProfile } from "@/types";

export class CertificateError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CertificateError";
    this.status = status;
  }
}

export function canManageCertificates(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.CERTIFICATES_MANAGE);
}

export function assertCanManageCertificates(user: UserProfile) {
  if (!canManageCertificates(user)) {
    throw new CertificateError("Certificate management permission required", 403);
  }
}

export function assertOwnOrManage(user: UserProfile, studentId: string) {
  if (user.id === studentId) return;
  if (canManageCertificates(user)) return;
  if (user.role === ROLES.INSTRUCTOR && hasPermission(user.role, PERMISSIONS.REPORTS_OWN)) {
    return;
  }
  if (hasPermission(user.role, PERMISSIONS.REPORTS_VIEW)) return;
  throw new CertificateError("Access denied", 403);
}

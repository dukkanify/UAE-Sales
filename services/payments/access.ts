/**
 * Payment access helpers.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import type { UserProfile } from "@/types";

export class PaymentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
  }
}

export function canCheckout(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.BILLING_OWN) || user.role === ROLES.STUDENT;
}

export function canManageFinance(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.SYSTEM_PAYMENTS) ||
    hasPermission(user.role, PERMISSIONS.FINANCE_REPORTS) ||
    hasPermission(user.role, PERMISSIONS.FINANCE_WALLETS)
  );
}

export function canManageCoupons(user: UserProfile): boolean {
  return canManageFinance(user) || user.role === ROLES.ADMIN;
}

export function canOwnWallet(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.WALLET_OWN);
}

export function assertCanCheckout(user: UserProfile) {
  if (!canCheckout(user) && user.role !== ROLES.STUDENT) {
    throw new PaymentError("Billing permission required", 403);
  }
}

export function assertCanManageFinance(user: UserProfile) {
  if (!canManageFinance(user) && user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN) {
    throw new PaymentError("Finance permission required", 403);
  }
}

export function assertOwnOrder(user: UserProfile, studentId: string) {
  if (user.id === studentId) return;
  if (canManageFinance(user) || user.role === ROLES.ADMIN) return;
  throw new PaymentError("Access denied", 403);
}

export function assertOwnWallet(user: UserProfile, instructorId: string) {
  if (user.id === instructorId && canOwnWallet(user)) return;
  if (hasPermission(user.role, PERMISSIONS.FINANCE_WALLETS)) return;
  throw new PaymentError("Wallet access denied", 403);
}

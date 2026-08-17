import type { AdminPermission, UserProfile } from "@/types/domain/user";

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  "users",
  "listings",
  "orders",
  "disputes",
  "payments",
  "reports",
  "settings",
  "categories",
];

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  users: "المستخدمون",
  listings: "الإعلانات",
  orders: "الطلبات",
  disputes: "النزاعات",
  payments: "المدفوعات",
  reports: "التقارير",
  settings: "الإعدادات",
  categories: "التصنيفات والمواقع",
};

/** Empty/undefined adminPermissions = full access for admins. */
export function hasAdminPermission(
  user: Pick<UserProfile, "role" | "adminPermissions"> | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!user || user.role !== "admin") return false;
  const perms = user.adminPermissions;
  if (!perms || perms.length === 0) return true;
  return perms.includes(permission);
}

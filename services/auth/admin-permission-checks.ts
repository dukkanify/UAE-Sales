import type {
  AdminAction,
  AdminActionMatrix,
  AdminPermission,
  UserProfile,
} from "@/types/domain/user";

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

export const ALL_ADMIN_ACTIONS: AdminAction[] = [
  "view",
  "add",
  "edit",
  "delete",
  "approve",
  "export",
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

export const ADMIN_ACTION_LABELS: Record<AdminAction, string> = {
  view: "عرض",
  add: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  approve: "اعتماد",
  export: "تصدير",
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

/**
 * Module + action matrix check.
 * Super admin (empty modules) → all actions.
 * Module granted without matrix entry → all actions for that module (compat).
 */
export function hasAdminAction(
  user:
    | Pick<UserProfile, "role" | "adminPermissions" | "adminActionMatrix">
    | null
    | undefined,
  permission: AdminPermission,
  action: AdminAction = "view",
): boolean {
  if (!hasAdminPermission(user, permission)) return false;
  if (!user) return false;
  const perms = user.adminPermissions;
  if (!perms || perms.length === 0) return true;
  const matrix: AdminActionMatrix | undefined = user.adminActionMatrix;
  const actions = matrix?.[permission];
  if (!actions || actions.length === 0) return true;
  return actions.includes(action);
}

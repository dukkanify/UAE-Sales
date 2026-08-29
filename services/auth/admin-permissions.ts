import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import {
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LABELS,
  hasAdminPermission,
  hasAdminAction,
} from "@/services/auth/admin-permission-checks";
import type {
  AdminAction,
  AdminPermission,
  UserProfile,
} from "@/types/domain/user";

export {
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LABELS,
  hasAdminPermission,
  hasAdminAction,
};

export async function requireAdminPermission(
  permission: AdminPermission,
  action: AdminAction = "view",
): Promise<UserProfile | NextResponse> {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  if (!hasAdminAction(admin, permission, action)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return admin;
}

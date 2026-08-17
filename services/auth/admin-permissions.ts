import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import {
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LABELS,
  hasAdminPermission,
} from "@/services/auth/admin-permission-checks";
import type { AdminPermission, UserProfile } from "@/types/domain/user";

export {
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_LABELS,
  hasAdminPermission,
};

export async function requireAdminPermission(
  permission: AdminPermission,
): Promise<UserProfile | NextResponse> {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  if (!hasAdminPermission(admin, permission)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return admin;
}

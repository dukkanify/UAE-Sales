import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import { listUsersByRole } from "@/services/dashboard/metrics";
import { ROLES, type Role } from "@/constants/roles";
import { hasMinRole } from "@/utils/rbac";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (!hasMinRole(user.role, ROLES.ADMIN)) {
      return NextResponse.json(
        { success: false, data: null, error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as Role | null;
    const users = listUsersByRole(role ?? undefined);

    // Admins cannot see super_admins in lists unless they are super admin
    const filtered =
      user.role === ROLES.SUPER_ADMIN
        ? users
        : users.filter((u) => u.role !== ROLES.SUPER_ADMIN);

    return NextResponse.json({ success: true, data: filtered, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

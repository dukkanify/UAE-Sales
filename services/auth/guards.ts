import { NextResponse } from "next/server";

import { ACCOUNT_STATUS } from "@/constants/account-status";
import { routes } from "@/constants/routes";
import { getCurrentSession } from "@/services/auth/auth-service";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import type { Permission } from "@/constants/permissions";
import type { UserProfile } from "@/types";

export function getRequestContext(request: Request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
    userAgent: request.headers.get("user-agent"),
  };
}

export async function requireAuth(): Promise<UserProfile> {
  const { user } = await getCurrentSession();
  if (!user) {
    throw new PermissionError("Authentication required", 401);
  }
  if (user.status === ACCOUNT_STATUS.SUSPENDED) {
    throw new PermissionError("Account suspended", 403);
  }
  if (user.status === ACCOUNT_STATUS.INACTIVE) {
    throw new PermissionError("Account inactive", 403);
  }
  return user;
}

export async function requirePermission(permission: Permission): Promise<UserProfile> {
  const user = await requireAuth();
  assertPermission(user, permission);
  return user;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json(
    { success: false, data: null, error: "Internal server error" },
    { status: 500 },
  );
}

export function redirectForAuthFailure(error: unknown): string {
  if (error instanceof PermissionError) {
    if (error.message.includes("suspended")) return routes.accountSuspended;
    if (error.status === 401) return routes.sessionExpired;
    return routes.accessDenied;
  }
  return routes.accessDenied;
}

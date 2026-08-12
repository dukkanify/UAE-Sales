import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import type { UserProfile } from "@/types";

export async function requireSessionUser(): Promise<UserProfile | NextResponse> {
  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return user;
}

export async function requireAdminUser(): Promise<UserProfile | NextResponse> {
  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (user.accountStatus === "suspended") {
    return NextResponse.json({ error: "ACCOUNT_SUSPENDED" }, { status: 403 });
  }
  return user;
}

export function isSessionUser(
  result: UserProfile | NextResponse,
): result is UserProfile {
  return !(result instanceof NextResponse);
}

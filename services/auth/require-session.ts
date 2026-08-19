import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookie } from "@/services/auth/session-cookie";
import { findUserById, toUserProfile } from "@/services/auth/user-store";
import type { UserProfile } from "@/types";

function sessionVersionOf(user: { sessionVersion?: number } | null | undefined): number {
  return user?.sessionVersion ?? 0;
}

export async function getValidSessionUser(): Promise<UserProfile | null> {
  const session = await getSessionFromCookie();
  if (!session) return null;

  const stored = await findUserById(session.id);
  if (!stored) return null;
  if (sessionVersionOf(stored) !== sessionVersionOf(session)) {
    await clearSessionCookie();
    return null;
  }
  return toUserProfile(stored);
}

export async function requireSessionUser(): Promise<UserProfile | NextResponse> {
  const user = await getValidSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return user;
}

export async function requireAdminUser(): Promise<UserProfile | NextResponse> {
  const user = await getValidSessionUser();
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

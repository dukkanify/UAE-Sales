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

export function isSessionUser(result: UserProfile | NextResponse): result is UserProfile {
  return !(result instanceof NextResponse);
}

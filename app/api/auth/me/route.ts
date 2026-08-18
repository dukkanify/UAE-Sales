import { NextResponse } from "next/server";
import { getSessionFromCookie, setSessionCookie } from "@/services/auth/session-cookie";
import { findUserById, toUserProfile } from "@/services/auth/user-store";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const stored = await findUserById(session.id);
  if (!stored) {
    return NextResponse.json({ user: session });
  }

  const user = toUserProfile(stored);
  if (
    user.accountStatus !== session.accountStatus ||
    user.emailVerifiedAt !== session.emailVerifiedAt ||
    user.isVerified !== session.isVerified
  ) {
    await setSessionCookie(user);
  }

  return NextResponse.json({ user });
}

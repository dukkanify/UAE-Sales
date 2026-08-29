import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/services/auth/session-cookie";
import {
  getValidSessionUser,
} from "@/services/auth/require-session";

/**
 * GET — return the authenticated user from the signed cookie + DB.
 * POST — refresh signed cookie from DB for the current session only.
 *        Never accepts a client-supplied user profile (forge prevention).
 * DELETE — clear session cookie (logout). Does not delete the account.
 */
export async function GET() {
  const user = await getValidSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function POST() {
  const user = await getValidSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in required to refresh session." },
      { status: 401 },
    );
  }
  await setSessionCookie(user);
  return NextResponse.json({ ok: true, user });
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SESSION_CLEAR_FAILED" }, { status: 500 });
  }
}

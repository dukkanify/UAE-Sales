import { NextResponse } from "next/server";
import { z } from "zod";
import { findDemoAccountByIdentifier } from "@/mock/demo-accounts.mock";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { getRedirectAfterAuth } from "@/services/auth/user-store";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { findUserByEmail, toUserProfile } from "@/services/auth/user-store";
import { getPostLoginPath } from "@/services/auth/auth.service";
import { getSafeNextPath } from "@/shared/utils/safe-next";

const schema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const verifyResult = await handleOtpVerify({
    email,
    code: parsed.data.code,
    purpose: "LOGIN",
  });

  if (verifyResult instanceof NextResponse) {
    return verifyResult;
  }

  const stored = await findUserByEmail(email);
  const demo = findDemoAccountByIdentifier(email);

  let user = stored && stored.accountStatus === "active" ? toUserProfile(stored) : null;
  if (!user && demo) {
    user = demo.profile;
  }

  if (!user) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  await setSessionCookie(user);
  trackAuthEvent("login_verified");

  const redirectTo = parsed.data.next
    ? getSafeNextPath(parsed.data.next, getRedirectAfterAuth(user))
    : getSafeNextPath(null, getPostLoginPath(email, getRedirectAfterAuth(user)));

  return NextResponse.json({ ok: true, user, redirectTo });
}

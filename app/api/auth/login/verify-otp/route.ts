import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { SESSION_FAILED_MESSAGE } from "@/services/auth/auth-messages";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { findUserByEmail, getRedirectAfterAuth, toUserProfile } from "@/services/auth/user-store";
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
  const canEnter =
    stored &&
    Boolean(stored.emailVerifiedAt) &&
    (stored.accountStatus === "active" || stored.accountStatus === "pending");
  const user = canEnter ? toUserProfile(stored) : null;

  if (!user) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;
  try {
    await setSessionCookie(user);
  } catch {
    return NextResponse.json(
      { error: "SESSION_FAILED", message: SESSION_FAILED_MESSAGE },
      { status: 500 },
    );
  }
  trackAuthEvent("login_verified");

  const redirectTo = getSafeNextPath(
    parsed.data.next,
    getRedirectAfterAuth(user),
  );

  return NextResponse.json({ ok: true, user, redirectTo });
}

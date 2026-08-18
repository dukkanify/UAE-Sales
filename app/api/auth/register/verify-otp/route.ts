import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_FAILED_MESSAGE } from "@/services/auth/auth-messages";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { completePersonVerification } from "@/services/auth/signup-approval";
import {
  findUserByEmail,
  getRedirectAfterAuth,
} from "@/services/auth/user-store";

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
    purpose: "REGISTER",
  });

  if (verifyResult instanceof NextResponse) {
    trackAuthEvent("registration_failed");
    return verifyResult;
  }

  const stored = await findUserByEmail(email);
  if (!stored) {
    trackAuthEvent("registration_failed");
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const { approved, user } = await completePersonVerification(stored.id);

  try {
    await setSessionCookie(user);
  } catch {
    trackAuthEvent("registration_failed");
    return NextResponse.json(
      { error: "SESSION_FAILED", message: SESSION_FAILED_MESSAGE },
      { status: 500 },
    );
  }

  trackAuthEvent("registration_verified", { accountType: user.accountType });

  const redirectTo = approved
    ? getRedirectAfterAuth(user, parsed.data.next)
    : "/register/pending";

  return NextResponse.json({
    ok: true,
    approved,
    user,
    redirectTo,
  });
}

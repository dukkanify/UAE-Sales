import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { SESSION_FAILED_MESSAGE } from "@/services/auth/auth-messages";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { sendWelcomeEmail } from "@/services/email/email.service";
import {
  activateUser,
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

  const metadata = verifyResult.record.metadata;
  const userId = metadata?.userId;
  if (!userId) {
    trackAuthEvent("registration_failed");
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const stored = await findUserByEmail(email);
  if (!stored) {
    trackAuthEvent("registration_failed");
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const user = await activateUser(userId);
  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;
  try {
    await setSessionCookie(user);
  } catch {
    trackAuthEvent("registration_failed");
    return NextResponse.json(
      { error: "SESSION_FAILED", message: SESSION_FAILED_MESSAGE },
      { status: 500 },
    );
  }

  void sendWelcomeEmail({ email: user.email, name: user.fullName }).catch(() => undefined);
  trackAuthEvent("registration_verified", { accountType: user.accountType });

  const redirectTo = getRedirectAfterAuth(user, parsed.data.next);

  return NextResponse.json({
    ok: true,
    user,
    redirectTo,
  });
}

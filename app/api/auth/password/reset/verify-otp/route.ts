import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { issuePasswordResetToken } from "@/services/auth/password-reset-token";
import { emailPasswordResetLink } from "@/services/email/notification-emails";
import { findUserByEmail } from "@/services/auth/user-store";
import { maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const verifyResult = await handleOtpVerify({
    email,
    code: parsed.data.code,
    purpose: "PASSWORD_RESET",
  });

  if (verifyResult instanceof NextResponse) {
    return verifyResult;
  }

  const user = await findUserByEmail(email);
  if (user?.passwordHash) {
    const rawToken = await issuePasswordResetToken({
      email: user.email,
      userId: user.id,
    });
    void emailPasswordResetLink({
      email: user.email,
      name: user.fullName,
      token: rawToken,
    }).catch((error) => {
      console.error("[Sooqna Email] password reset link failed", error);
    });
  }

  return NextResponse.json({
    ok: true,
    maskedEmail: maskEmail(email),
    redirectTo: "/login",
  });
}

import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { sendLoginVerificationEmail } from "@/services/email/email.service";
import { findUserByEmail } from "@/services/auth/user-store";
import { verifyPassword } from "@/services/auth/password.service";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function passwordMatches(storedHash: string, password: string): boolean {
  try {
    return verifyPassword(password, storedHash);
  } catch {
    return false;
  }
}

function genericResponse(email: string) {
  return NextResponse.json({
    ok: true,
    maskedEmail: maskEmail(email),
    message: "إذا كان الحساب موجودًا، فسيتم إرسال رمز التحقق إلى بريدك الإلكتروني.",
  });
}

export async function POST(request: Request) {
  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const stored = await findUserByEmail(email);
    if (!stored?.passwordHash || !passwordMatches(stored.passwordHash, parsed.data.password)) {
      return genericResponse(email);
    }

    const { code } = await createOtpRequest({
      email: stored.email,
      purpose: "LOGIN",
      userId: stored.id,
    });

    await sendLoginVerificationEmail({
      email: stored.email,
      name: stored.fullName,
      otp: code,
    });

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(stored.email),
      email: stored.email,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("RESEND_COOLDOWN:")) {
      const seconds = Number(error.message.split(":")[1] ?? 60);
      return NextResponse.json(
        { error: "RESEND_COOLDOWN", retryAfterSeconds: seconds },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "OTP_REQUEST_FAILED" }, { status: 500 });
  }
}

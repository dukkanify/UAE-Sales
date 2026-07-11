import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { sendLoginVerificationEmail } from "@/services/email/email.service";
import { findDemoAccount } from "@/mock/demo-accounts.mock";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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
    const account = findDemoAccount(email, parsed.data.password);

    if (!account) {
      // Generic response — do not reveal whether email exists
      return NextResponse.json({
        ok: true,
        maskedEmail: maskEmail(email),
        message: "إذا كان الحساب موجودًا، فسيتم إرسال رمز التحقق إلى بريدك الإلكتروني.",
      });
    }

    const { code } = await createOtpRequest({
      email: account.profile.email,
      purpose: "LOGIN",
    });

    await sendLoginVerificationEmail({
      email: account.profile.email,
      name: account.profile.fullName,
      otp: code,
    });

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(account.profile.email),
      email: account.profile.email,
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

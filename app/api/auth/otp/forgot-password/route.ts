import { NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/services/email/email.service";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();

    try {
      const { code } = await createOtpRequest({
        email,
        purpose: "PASSWORD_RESET",
      });
      await sendPasswordResetEmail({ email, name: "مستخدم سوقنا", otp: code });
    } catch {
      // Always return generic success
    }

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(email),
      message: "إذا كان الحساب موجودًا، فسيتم إرسال رمز التحقق إلى بريدك الإلكتروني.",
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

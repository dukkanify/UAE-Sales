import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { sendOtpEmail } from "@/services/email/email.service";
import { createOtpRequest, invalidateOtpRecord, maskEmail } from "@/services/otp/otp.service";
import { canRevealOtpToClient } from "@/services/otp/otp-config";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  password: z.string().min(8),
  accountType: z.enum(["individual", "company"]),
  city: z.string().min(1),
  phone: z.string().optional(),
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
    const { record, code } = await createOtpRequest({
      email,
      purpose: "REGISTER",
      metadata: {
        fullName: parsed.data.fullName,
        password: parsed.data.password,
        accountType: parsed.data.accountType,
        city: parsed.data.city,
        phone: parsed.data.phone ?? "",
      },
    });

    const delivered = await sendOtpEmail({
      email,
      name: parsed.data.fullName,
      otp: code,
    });

    if (!delivered && !canRevealOtpToClient(false)) {
      await invalidateOtpRecord(record.id);
      return NextResponse.json({ error: "EMAIL_SEND_FAILED" }, { status: 503 });
    }

    const revealOtp = canRevealOtpToClient(delivered);
    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(email),
      email,
      emailDelivered: delivered,
      ...(revealOtp ? { otp: code } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("RESEND_COOLDOWN:")) {
      const seconds = Number(error.message.split(":")[1] ?? 60);
      return NextResponse.json(
        { error: "RESEND_COOLDOWN", retryAfterSeconds: seconds },
        { status: 429 },
      );
    }
    if (error instanceof Error && error.message === "EMAIL_SEND_FAILED") {
      return NextResponse.json({ error: "EMAIL_SEND_FAILED" }, { status: 503 });
    }
    return NextResponse.json({ error: "OTP_REQUEST_FAILED" }, { status: 500 });
  }
}

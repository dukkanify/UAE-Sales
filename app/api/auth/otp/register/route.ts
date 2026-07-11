import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtpEmail } from "@/services/email/email.service";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  password: z.string().min(8),
  accountType: z.enum(["individual", "company"]),
  city: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { code } = await createOtpRequest({
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

    await sendOtpEmail({
      email,
      name: parsed.data.fullName,
      otp: code,
    });

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(email),
      email,
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

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  otpSendFailedResponse,
  sendOtpForPurpose,
} from "@/services/auth/auth-handlers";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import type { OtpPurpose } from "@/types/domain/otp";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  purpose: z.enum([
    "REGISTER",
    "LOGIN",
    "PASSWORD_RESET",
    "SET_PASSWORD",
    "EMAIL_CHANGE",
    "SENSITIVE_ACTION",
  ]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    await sendOtpForPurpose({
      email,
      fullName: parsed.data.fullName ?? "مستخدم سوقنا",
      purpose: parsed.data.purpose as OtpPurpose,
    });

    trackAuthEvent("otp_resend", { purpose: parsed.data.purpose });
    return genericOtpResponse(email);
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    return otpSendFailedResponse();
  }
}

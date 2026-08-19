import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  otpSendFailedResponse,
  sendOtpForPurpose,
  sendRegistrationVerifyOtp,
} from "@/services/auth/auth-handlers";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { findUserByEmail } from "@/services/auth/user-store";
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

    if (parsed.data.purpose !== "REGISTER") {
      const disabled = emailOtpDisabledResponse();
      if (disabled) return disabled;
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    if (parsed.data.purpose === "REGISTER") {
      const stored = await findUserByEmail(email);
      if (stored) {
        const sent = await sendRegistrationVerifyOtp({
          email,
          fullName: parsed.data.fullName ?? stored.fullName,
          userId: stored.id,
          accountType: stored.accountType,
        });
        trackAuthEvent("otp_resend", { purpose: parsed.data.purpose });
        return genericOtpResponse(email, {
          emailDelivered: sent.delivered,
        });
      }
      trackAuthEvent("otp_resend", { purpose: parsed.data.purpose });
      return genericOtpResponse(email);
    }

    const sent = await sendOtpForPurpose({
      email,
      fullName: parsed.data.fullName ?? "مستخدم سوقنا",
      purpose: parsed.data.purpose as OtpPurpose,
    });

    trackAuthEvent("otp_resend", { purpose: parsed.data.purpose });
    return genericOtpResponse(email, {
      emailDelivered: sent.delivered,
    });
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    return otpSendFailedResponse();
  }
}

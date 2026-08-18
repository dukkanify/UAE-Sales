import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  otpSendFailedResponse,
  sendOtpForPurpose,
} from "@/services/auth/auth-handlers";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { findUserByEmail } from "@/services/auth/user-store";

const schema = z.object({
  email: z.string().email(),
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

    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    const stored = await findUserByEmail(email);
    const canLogin = Boolean(
      stored?.emailVerifiedAt &&
        (stored.accountStatus === "active" || stored.accountStatus === "pending"),
    );

    if (canLogin && stored) {
      await sendOtpForPurpose({
        email,
        fullName: stored.fullName,
        purpose: "LOGIN",
        userId: stored.id,
      });
      trackAuthEvent("login_otp_sent");
    }

    return genericOtpResponse(email);
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    return otpSendFailedResponse();
  }
}

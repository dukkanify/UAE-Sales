import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { findDemoAccountByIdentifier } from "@/mock/demo-accounts.mock";
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
    const demo = findDemoAccountByIdentifier(email);
    const canLogin = (stored?.accountStatus === "active" && stored.emailVerifiedAt) || demo;

    if (canLogin) {
      await sendOtpForPurpose({
        email,
        fullName: stored?.fullName ?? demo?.profile.fullName ?? "مستخدم سوقنا",
        purpose: "LOGIN",
        userId: stored?.id ?? demo?.profile.id,
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

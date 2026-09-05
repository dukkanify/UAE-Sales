import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  sendOtpForPurpose,
} from "@/services/auth/auth-handlers";
import { EMAIL_ALREADY_REGISTERED_MESSAGE, OTP_SEND_FAILED_MESSAGE } from "@/services/auth/auth-messages";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import {
  createPendingUser,
  findUserByEmail,
  isRegisteredAccount,
} from "@/services/auth/user-store";
import { canRevealOtpToClient } from "@/services/otp/otp-config";

const schema = z.object({
  accountType: z.enum(["individual", "company"]),
  email: z.string().email(),
  fullName: z.string().min(3),
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
    trackAuthEvent("registration_started", { accountType: parsed.data.accountType });

    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    const existing = await findUserByEmail(email);
    if (existing && isRegisteredAccount(existing)) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_REGISTERED", message: EMAIL_ALREADY_REGISTERED_MESSAGE },
        { status: 409 },
      );
    }

    const pending = await createPendingUser({
      email,
      fullName: parsed.data.fullName,
      accountType: parsed.data.accountType,
    });

    try {
      const sent = await sendOtpForPurpose({
        email,
        fullName: parsed.data.fullName,
        purpose: "REGISTER",
        userId: pending.id,
        metadata: {
          fullName: parsed.data.fullName,
          accountType: parsed.data.accountType,
          userId: pending.id,
        },
      });
      trackAuthEvent("registration_otp_sent");
      return genericOtpResponse(email, {
        emailDelivered: sent.delivered,
        ...(canRevealOtpToClient(sent.delivered) ? { otp: sent.code } : {}),
      });
    } catch (sendError) {
      const cooldown = otpCooldownResponse(sendError);
      if (cooldown) return cooldown;
      trackAuthEvent("registration_failed");
      return genericOtpResponse(email, { emailDelivered: false });
    }
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_REGISTERED", message: EMAIL_ALREADY_REGISTERED_MESSAGE },
        { status: 409 },
      );
    }
    trackAuthEvent("registration_failed");
    return NextResponse.json(
      { error: "EMAIL_SEND_FAILED", message: OTP_SEND_FAILED_MESSAGE },
      { status: 503 },
    );
  }
}

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
import {
  createPendingUser,
  deletePendingUser,
  findUserByEmail,
} from "@/services/auth/user-store";

const schema = z.object({
  accountType: z.enum(["individual", "company"]),
  email: z.string().email(),
  fullName: z.string().min(3),
});

export async function POST(request: Request) {
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
    if (existing?.accountStatus === "active" && existing.emailVerifiedAt) {
      return genericOtpResponse(email);
    }

    const pending = await createPendingUser({
      email,
      fullName: parsed.data.fullName,
      accountType: parsed.data.accountType,
    });

    try {
      await sendOtpForPurpose({
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
    } catch (sendError) {
      await deletePendingUser(pending.id);
      throw sendError;
    }

    trackAuthEvent("registration_otp_sent");
    return genericOtpResponse(email);
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    if (error instanceof Error && error.message === "EMAIL_SEND_FAILED") {
      trackAuthEvent("registration_failed");
      return otpSendFailedResponse();
    }
    trackAuthEvent("registration_failed");
    return otpSendFailedResponse();
  }
}

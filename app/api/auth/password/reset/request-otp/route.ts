import { NextResponse } from "next/server";
import { z } from "zod";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  otpSendFailedResponse,
  sendOtpForPurpose,
} from "@/services/auth/auth-handlers";
import { findUserByEmail } from "@/services/auth/user-store";

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
    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    const user = await findUserByEmail(email);
    if (user?.passwordHash) {
      await sendOtpForPurpose({
        email,
        fullName: user.fullName,
        purpose: "PASSWORD_RESET",
        userId: user.id,
      });
    }

    return genericOtpResponse(email);
  } catch (error) {
    const cooldown = otpCooldownResponse(error);
    if (cooldown) return cooldown;
    return otpSendFailedResponse();
  }
}

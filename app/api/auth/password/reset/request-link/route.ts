import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PASSWORD_RESET_GENERIC_MESSAGE,
} from "@/services/auth/auth-messages";
import { enforceRateLimit } from "@/services/auth/auth-handlers";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";
import { issuePasswordResetToken } from "@/services/auth/password-reset-token";
import { findUserByEmail } from "@/services/auth/user-store";
import { emailPasswordResetLink } from "@/services/email/notification-emails";
import { maskEmail } from "@/shared/utils/mask-email";

const schema = z.object({
  email: z.string().email(),
});

function genericResponse(email: string) {
  return NextResponse.json({
    ok: true,
    message: PASSWORD_RESET_GENERIC_MESSAGE,
    maskedEmail: maskEmail(email),
  });
}

async function allowResetRequest(request: Request, email: string): Promise<boolean> {
  if (!(await enforceRateLimit(request, email))) return false;
  const ip = getClientIp(request);
  const emailAllowed = await checkRateLimit(`password-reset:email:${email}`);
  const ipAllowed = await checkRateLimit(`password-reset:ip:${ip}`);
  return emailAllowed && ipAllowed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (!(await allowResetRequest(request, email))) {
      return genericResponse(email);
    }

    const user = await findUserByEmail(email);
    if (user?.passwordHash) {
      const rawToken = await issuePasswordResetToken({
        email: user.email,
        userId: user.id,
      });
      void emailPasswordResetLink({
        email: user.email,
        name: user.fullName,
        token: rawToken,
      }).catch((error) => {
        console.error("[Sooqna Email] password reset link failed", error);
      });
    }

    return genericResponse(email);
  } catch (error) {
    console.error("[Sooqna Email] password reset request failed", error);
    return NextResponse.json({
      ok: true,
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  }
}

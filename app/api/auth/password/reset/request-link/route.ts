import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createResetToken,
  enforceRateLimit,
  storeResetToken,
} from "@/services/auth/auth-handlers";
import { findUserByEmail } from "@/services/auth/user-store";
import {
  buildEmailDedupeKey,
  findRecentEmailLog,
} from "@/services/email/email-log-store";
import { emailPasswordResetLink } from "@/services/email/notification-emails";
import { maskEmail } from "@/shared/utils/mask-email";

const schema = z.object({
  email: z.string().email(),
});

function genericResponse(email: string) {
  return NextResponse.json({
    ok: true,
    message: "إذا كان البريد مسجلاً، ستصلك رسالة برابط آمن لإعادة تعيين كلمة المرور.",
    maskedEmail: maskEmail(email),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (!(await enforceRateLimit(request, email))) {
      return genericResponse(email);
    }

    const user = await findUserByEmail(email);
    if (user?.passwordHash) {
      const recent = await findRecentEmailLog(
        buildEmailDedupeKey({
          type: "password_reset",
          to: email,
          entityId: email,
        }),
        2 * 60 * 1000,
      );
      if (!recent) {
        const token = createResetToken(email);
        await storeResetToken(email, token);
        void emailPasswordResetLink({
          email,
          name: user.fullName,
          token,
        }).catch((error) => {
          console.error("[Sooqna Email] password reset link failed", error);
        });
      }
    }

    return genericResponse(email);
  } catch (error) {
    console.error("[Sooqna Email] password reset request failed", error);
    return NextResponse.json({
      ok: true,
      message: "إذا كان البريد مسجلاً، ستصلك رسالة برابط آمن لإعادة تعيين كلمة المرور.",
    });
  }
}

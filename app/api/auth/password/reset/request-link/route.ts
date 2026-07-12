import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";
import { findUserByEmail } from "@/services/auth/user-store";
import { createPasswordResetToken } from "@/services/auth/token.service";
import { sendPasswordResetLinkEmail } from "@/services/email/order-email.service";

const schema = z.object({
  email: z.string().email(),
});

const GENERIC_RESPONSE = {
  ok: true,
  message: "إذا كان البريد مسجّلًا لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور.",
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`password-reset:ip:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await findUserByEmail(email);

  if (user?.passwordHash) {
    try {
      const rawToken = await createPasswordResetToken(email);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetLinkEmail({
        email,
        name: user.fullName,
        resetLink,
      });
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.info("[Sooqna Email:queued] password reset for", email);
      }
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}

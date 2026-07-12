import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { consumePasswordResetToken } from "@/services/auth/token.service";
import { findUserByEmail, setUserPassword } from "@/services/auth/user-store";
import { checkRateLimit, getClientIp, recordRateLimitFailure } from "@/services/auth/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

const GENERIC_ERROR = "تعذر إعادة تعيين كلمة المرور. حاول مرة أخرى لاحقًا.";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`password-reset-complete:ip:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "تم تجاوز عدد المحاولات. يرجى الانتظار 15 دقيقة ثم المحاولة مرة أخرى.",
      },
      { status: 429 },
    );
  }

  if (parsed.data.password !== parsed.data.confirmPassword || !isStrongPassword(parsed.data.password)) {
    await recordRateLimitFailure(`password-reset-complete:ip:${ip}`);
    return NextResponse.json({ error: "RESET_FAILED", message: GENERIC_ERROR }, { status: 400 });
  }

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed) {
    await recordRateLimitFailure(`password-reset-complete:ip:${ip}`);
    return NextResponse.json({ error: "RESET_FAILED", message: GENERIC_ERROR }, { status: 400 });
  }

  const user = await findUserByEmail(consumed.email);
  if (!user) {
    await recordRateLimitFailure(`password-reset-complete:ip:${ip}`);
    return NextResponse.json({ error: "RESET_FAILED", message: GENERIC_ERROR }, { status: 400 });
  }

  await setUserPassword(user.id, hashPassword(parsed.data.password));

  return NextResponse.json({
    ok: true,
    message: "تم تحديث كلمة المرور بنجاح.",
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PASSWORD_RESET_EXPIRED_MESSAGE,
  PASSWORD_RESET_INVALID_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from "@/services/auth/auth-messages";
import { consumePasswordResetToken } from "@/services/auth/password-reset-token";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { STRONG_PASSWORD_HINT } from "@/shared/utils/password-rules";
import { clearSessionCookie } from "@/services/auth/session-cookie";
import { findUserById, setUserPassword } from "@/services/auth/user-store";

const schema = z.object({
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8).optional(),
  token: z.string().min(16).optional(),
  resetToken: z.string().min(16).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const rawToken = (parsed.data.token ?? parsed.data.resetToken ?? "").trim();
  const newPassword = parsed.data.newPassword.trim();
  if (parsed.data.confirmPassword && parsed.data.confirmPassword.trim() !== newPassword) {
    return NextResponse.json(
      { error: "PASSWORD_MISMATCH", message: "كلمتا المرور غير متطابقتين." },
      { status: 400 },
    );
  }
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: STRONG_PASSWORD_HINT },
      { status: 400 },
    );
  }

  const consumed = await consumePasswordResetToken(rawToken);
  if (!consumed.ok) {
    const message =
      consumed.status === "expired"
        ? PASSWORD_RESET_EXPIRED_MESSAGE
        : PASSWORD_RESET_INVALID_MESSAGE;
    return NextResponse.json(
      { error: consumed.status === "expired" ? "TOKEN_EXPIRED" : "INVALID_TOKEN", message },
      { status: 400 },
    );
  }

  const user = await findUserById(consumed.userId);
  if (!user) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: PASSWORD_RESET_INVALID_MESSAGE },
      { status: 400 },
    );
  }

  await setUserPassword(user.id, hashPassword(newPassword));
  await clearSessionCookie();
  return NextResponse.json({
    ok: true,
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
  });
}

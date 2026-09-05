import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PASSWORD_RESET_EXPIRED_MESSAGE,
  PASSWORD_RESET_INVALID_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from "@/services/auth/auth-messages";
import {
  consumePasswordResetToken,
  inspectPasswordResetToken,
} from "@/services/auth/password-reset-token";
import {
  hashPassword,
  isStrongPassword,
} from "@/services/auth/password.service";
import { STRONG_PASSWORD_HINT } from "@/shared/utils/password-rules";
import { clearSessionCookie } from "@/services/auth/session-cookie";
import { findUserById, setUserPassword } from "@/services/auth/user-store";

const confirmSchema = z.object({
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
  token: z.string().min(16),
});

function tokenErrorResponse(status: "expired" | "invalid") {
  if (status === "expired") {
    return NextResponse.json(
      { error: "TOKEN_EXPIRED", message: PASSWORD_RESET_EXPIRED_MESSAGE },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { error: "INVALID_TOKEN", message: PASSWORD_RESET_INVALID_MESSAGE },
    { status: 400 },
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  const status = await inspectPasswordResetToken(token);
  if (status === "valid") {
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  const response = tokenErrorResponse(status);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: PASSWORD_RESET_INVALID_MESSAGE },
      { status: 400 },
    );
  }

  const newPassword = parsed.data.newPassword.trim();
  const confirmPassword = parsed.data.confirmPassword.trim();
  if (newPassword !== confirmPassword) {
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

  const consumed = await consumePasswordResetToken(parsed.data.token.trim());
  if (!consumed.ok) {
    return tokenErrorResponse(consumed.status);
  }

  const user = await findUserById(consumed.userId);
  if (!user) {
    return tokenErrorResponse("invalid");
  }

  await setUserPassword(user.id, hashPassword(newPassword));
  await clearSessionCookie();

  return NextResponse.json({
    ok: true,
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
  });
}

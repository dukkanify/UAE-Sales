import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import { handleOtpVerify } from "@/services/auth/auth-handlers";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";
import { setUserPassword } from "@/services/auth/user-store";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { trackAuthEvent } from "@/services/analytics/auth-events";

const schema = z.object({
  code: z.string().length(6),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

export async function POST(request: Request) {
  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;

  const sessionUser = await requireSessionUser();
  if (!isSessionUser(sessionUser)) return sessionUser;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  if (!isStrongPassword(parsed.data.newPassword)) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: "كلمة المرور ضعيفة." },
      { status: 400 },
    );
  }

  const verifyResult = await handleOtpVerify({
    email: sessionUser.email,
    code: parsed.data.code,
    purpose: "SET_PASSWORD",
  });

  if (verifyResult instanceof NextResponse) {
    return verifyResult;
  }

  const user = await setUserPassword(
    sessionUser.id,
    hashPassword(parsed.data.newPassword),
  );
  await setSessionCookie(user);
  trackAuthEvent("password_added");

  return NextResponse.json({ ok: true, user, message: "تم حفظ كلمة المرور." });
}

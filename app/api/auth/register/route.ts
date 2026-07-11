import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { setSessionCookie } from "@/services/auth/session-cookie";
import {
  createStandardUser,
  getRedirectAfterAuth,
  toUserProfile,
} from "@/services/auth/user-store";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { getSafeNextPath } from "@/shared/utils/safe-next";

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  accountType: z.enum(["individual", "company"]).default("individual"),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return NextResponse.json(
      { error: "PASSWORD_MISMATCH", message: "كلمتا المرور غير متطابقتين." },
      { status: 400 },
    );
  }

  if (!isStrongPassword(parsed.data.password)) {
    return NextResponse.json(
      {
        error: "WEAK_PASSWORD",
        message: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع حرف كبير وصغير ورقم.",
      },
      { status: 400 },
    );
  }

  try {
    const stored = await createStandardUser({
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      passwordHash: hashPassword(parsed.data.password),
      accountType: parsed.data.accountType,
    });
    const profile = toUserProfile(stored);
    await setSessionCookie(profile);
    trackAuthEvent("registration_verified");

    const redirectTo = getSafeNextPath(
      parsed.data.next,
      getRedirectAfterAuth(profile, parsed.data.next),
    );

    return NextResponse.json({ ok: true, user: profile, redirectTo });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_REGISTERED", message: "هذا البريد مسجّل مسبقًا." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}

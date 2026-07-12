import { NextResponse } from "next/server";
import { z } from "zod";
import { markGuestConverted } from "@/services/auth/guest-account.service";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { consumeAccountSetupToken } from "@/services/auth/token.service";
import { findUserById, toUserProfile } from "@/services/auth/user-store";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
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

  const consumed = await consumeAccountSetupToken(parsed.data.token);
  if (!consumed) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: "رابط إعداد الحساب غير صالح أو منتهي." },
      { status: 400 },
    );
  }

  const user = await findUserById(consumed.userId);
  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const passwordHash = hashPassword(parsed.data.password);
  const updated = await markGuestConverted(consumed.userId, passwordHash, true);
  if (!updated) {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }

  const profile = toUserProfile(updated);
  await setSessionCookie(profile);

  return NextResponse.json({
    ok: true,
    user: profile,
    redirectTo: "/orders",
  });
}

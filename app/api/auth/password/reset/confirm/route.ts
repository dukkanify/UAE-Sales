import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeResetToken } from "@/services/auth/auth-handlers";
import {
  hashPassword,
  isStrongPassword,
} from "@/services/auth/password.service";
import { findUserByEmail, setUserPassword } from "@/services/auth/user-store";

const schema = z.object({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
  resetToken: z.string().min(16),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (!isStrongPassword(parsed.data.newPassword)) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: "كلمة المرور ضعيفة." },
      { status: 400 },
    );
  }

  const valid = await consumeResetToken(email, parsed.data.resetToken);
  if (!valid) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: "انتهت صلاحية رابط إعادة التعيين." },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(email);
  if (user) {
    await setUserPassword(user.id, hashPassword(parsed.data.newPassword));
  }

  return NextResponse.json({
    ok: true,
    message: "تم تحديث كلمة المرور بنجاح.",
  });
}

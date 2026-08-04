import { NextResponse } from "next/server";

import { resetPassword } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { resetPasswordSchema } from "@/utils/validation";

export async function POST(request: Request) {
  await ensureCsrfToken();
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await resetPassword({
    email: parsed.data.email,
    resetToken: parsed.data.resetToken,
    password: parsed.data.password,
    ctx: getRequestContext(request),
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

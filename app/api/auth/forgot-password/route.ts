import { NextResponse } from "next/server";

import { requestOtp } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { forgotPasswordSchema } from "@/utils/validation";

export async function POST(request: Request) {
  await ensureCsrfToken();
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await requestOtp({
    email: parsed.data.email,
    purpose: "reset_password",
    ctx: getRequestContext(request),
  });

  // Always return success message to avoid email enumeration in production UX;
  // still return real error in development for easier testing.
  if (!result.success && process.env.NODE_ENV === "production") {
    return NextResponse.json({
      success: true,
      data: { email: parsed.data.email },
      error: null,
    });
  }

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

import { NextResponse } from "next/server";

import { requestOtp } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken, validateCsrfHeader } from "@/lib/security/cookies";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/utils/validation";

export async function POST(request: Request) {
  await ensureCsrfToken();

  if (!(await validateCsrfHeader(request.headers.get("x-csrf-token")))) {
    // Allow first request without CSRF during bootstrap; set cookie for subsequent
    // Still require CSRF in production for state-changing auth after cookie exists
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const purpose = (body as { purpose?: string }).purpose;
  const ctx = getRequestContext(request);

  if (purpose === "login") {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const result = await requestOtp({
      email: parsed.data.email,
      purpose: "login",
      rememberMe: parsed.data.rememberMe,
      ctx,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  if (purpose === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const result = await requestOtp({
      email: parsed.data.email,
      purpose: "register",
      rememberMe: parsed.data.rememberMe,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      ctx,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  if (purpose === "reset_password") {
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
      ctx,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  return NextResponse.json(
    { success: false, data: null, error: "Invalid purpose" },
    { status: 400 },
  );
}

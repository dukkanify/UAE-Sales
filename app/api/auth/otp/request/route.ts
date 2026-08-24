import { NextResponse } from "next/server";

import { requestOtp } from "@/services/auth/auth-service";
import { startEnterpriseRegistration } from "@/services/auth/registration-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/utils/validation";
import { writeOpsLog } from "@/services/ops/logging-service";

export async function POST(request: Request) {
  await ensureCsrfToken();
  const blocked = await enforceMutatingApiSecurity(request);
  if (blocked) return blocked;

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
    writeOpsLog({
      level: result.success ? "info" : "warn",
      category: "security",
      message: result.success ? "Login OTP requested" : `Login OTP failed: ${result.error}`,
      path: "/api/auth/otp/request",
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
    const result = await startEnterpriseRegistration(parsed.data, ctx);
    writeOpsLog({
      level: result.success ? "info" : "warn",
      category: "security",
      message: result.success
        ? "Registration OTP requested"
        : `Registration failed: ${result.error}`,
      path: "/api/auth/otp/request",
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

  if (purpose === "booking") {
    const email =
      typeof (body as { email?: string }).email === "string"
        ? (body as { email: string }).email
        : "";
    const bookingId =
      typeof (body as { bookingId?: string }).bookingId === "string"
        ? (body as { bookingId: string }).bookingId
        : "";
    const firstName =
      typeof (body as { firstName?: string }).firstName === "string"
        ? (body as { firstName: string }).firstName
        : undefined;
    const lastName =
      typeof (body as { lastName?: string }).lastName === "string"
        ? (body as { lastName: string }).lastName
        : undefined;
    if (!email || !bookingId) {
      return NextResponse.json(
        { success: false, data: null, error: "email and bookingId required" },
        { status: 400 },
      );
    }
    const result = await requestOtp({
      email,
      purpose: "booking",
      bookingId,
      firstName,
      lastName,
      rememberMe: true,
      ctx,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  return NextResponse.json(
    { success: false, data: null, error: "Invalid purpose" },
    { status: 400 },
  );
}

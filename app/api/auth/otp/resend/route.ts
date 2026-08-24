import { NextResponse } from "next/server";
import { z } from "zod";

import { requestOtp } from "@/services/auth/auth-service";
import { resendRegistrationOtp } from "@/services/auth/registration-service";
import { resendOtp } from "@/services/auth/otp-service";
import { findUserByEmail } from "@/services/auth/store";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { emailSchema } from "@/utils/validation";
import { writeOpsLog } from "@/services/ops/logging-service";

const resendSchema = z.object({
  email: emailSchema,
  purpose: z.enum([
    "login",
    "register",
    "reset_password",
    "verify_email",
    "booking",
    "change_email",
    "two_factor",
    "sensitive_action",
  ]),
  bookingId: z.string().min(1).optional(),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  await ensureCsrfToken();
  const blocked = await enforceMutatingApiSecurity(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const ctx = getRequestContext(request);
  const { email, purpose, bookingId, rememberMe } = parsed.data;

  let result;
  if (purpose === "register") {
    result = await resendRegistrationOtp(email, ctx);
  } else if (purpose === "login" || purpose === "reset_password" || purpose === "verify_email") {
    // Re-issue through the shared engine (enforces cooldown / max resends).
    const user = findUserByEmail(email);
    result = await resendOtp({
      email,
      purpose,
      userId: user?.id ?? null,
      rememberMe: Boolean(rememberMe),
      requireExisting: true,
      failClosed: true,
      ctx,
    });
  } else if (purpose === "booking") {
    result = await resendOtp({
      email,
      purpose: "booking",
      rememberMe: true,
      meta: { bookingId: bookingId ?? null },
      requireExisting: true,
      failClosed: true,
      ctx,
    });
  } else {
    // change_email / two_factor / sensitive_action — same engine
    const user = findUserByEmail(email);
    if (!user) {
      result = {
        success: false as const,
        data: null,
        error: "No account found for this email.",
      };
    } else {
      result = await resendOtp({
        email,
        purpose,
        userId: user.id,
        requireExisting: true,
        failClosed: true,
        ctx,
      });
    }
  }

  // Fallback: if no prior challenge for login, allow a fresh request once.
  if (!result.success && purpose === "login" && result.error?.includes("No active")) {
    result = await requestOtp({ email, purpose: "login", rememberMe, ctx });
  }

  writeOpsLog({
    level: result.success ? "info" : "warn",
    category: "security",
    message: result.success
      ? `OTP resent (${purpose})`
      : `OTP resend failed (${purpose}): ${result.error}`,
    path: "/api/auth/otp/resend",
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

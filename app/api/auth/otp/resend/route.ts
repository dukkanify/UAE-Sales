import { NextResponse } from "next/server";
import { z } from "zod";

import { resendRegistrationOtp } from "@/services/auth/registration-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { emailSchema } from "@/utils/validation";
import { writeOpsLog } from "@/services/ops/logging-service";

const resendSchema = z.object({
  email: emailSchema,
  purpose: z.literal("register"),
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

  const result = await resendRegistrationOtp(parsed.data.email, getRequestContext(request));
  writeOpsLog({
    level: result.success ? "info" : "warn",
    category: "security",
    message: result.success ? "Registration OTP resent" : `OTP resend failed: ${result.error}`,
    path: "/api/auth/otp/resend",
  });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

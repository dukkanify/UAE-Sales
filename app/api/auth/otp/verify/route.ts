import { NextResponse } from "next/server";

import { verifyOtp } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { verifyOtpSchema } from "@/utils/validation";
import { writeOpsLog } from "@/services/ops/logging-service";

export async function POST(request: Request) {
  await ensureCsrfToken();
  const blocked = await enforceMutatingApiSecurity(request);
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await verifyOtp({
    ...parsed.data,
    ctx: getRequestContext(request),
  });

  writeOpsLog({
    level: result.success ? "info" : "warn",
    category: "security",
    message: result.success ? "OTP verified" : `OTP failed: ${result.error}`,
    path: "/api/auth/otp/verify",
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

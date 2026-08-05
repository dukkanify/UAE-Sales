import { NextResponse } from "next/server";

import { verifyOtp } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { verifyOtpSchema } from "@/utils/validation";

export async function POST(request: Request) {
  await ensureCsrfToken();

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

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

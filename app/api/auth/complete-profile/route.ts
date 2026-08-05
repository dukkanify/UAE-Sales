import { NextResponse } from "next/server";

import { completeProfile } from "@/services/auth/auth-service";
import { authErrorResponse, getRequestContext, requireAuth } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { completeProfileSchema } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    await ensureCsrfToken();
    const user = await requireAuth();
    const body = await request.json().catch(() => null);
    const parsed = completeProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await completeProfile({
      userId: user.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || undefined,
      countryCode: parsed.data.countryCode || undefined,
      nationality: parsed.data.nationality || undefined,
      timezone: parsed.data.timezone,
      language: parsed.data.language,
      ctx: getRequestContext(request),
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return authErrorResponse(error);
  }
}

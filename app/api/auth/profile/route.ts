import { NextResponse } from "next/server";

import { updateProfile } from "@/services/auth/auth-service";
import { authErrorResponse, getRequestContext, requireAuth } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { updateProfileSchema } from "@/utils/validation";

export async function PATCH(request: Request) {
  try {
    await ensureCsrfToken();
    const user = await requireAuth();
    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const result = await updateProfile(
      user.id,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        countryCode: data.countryCode,
        nationality: data.nationality,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        city: data.city,
        bio: data.bio,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        timezone: data.timezone,
        language: data.language,
        avatarUrl: data.avatarUrl === null ? undefined : data.avatarUrl || undefined,
      },
      getRequestContext(request),
    );

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return authErrorResponse(error);
  }
}

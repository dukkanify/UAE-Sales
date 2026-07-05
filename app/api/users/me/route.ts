import { getUserProfile, updateUserProfile } from "@/lib/repositories/auth.repository";
import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { parseJsonBody, updateUserSchema } from "@/lib/api/validation";
import { isDatabaseConfigured } from "@/lib/prisma";
import { ApiHttpError } from "@/lib/api/response";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const user = await requireAuth();
    const profile = await getUserProfile(user.id);
    return jsonSuccess(profile);
  });
}

export async function PATCH(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const user = await requireAuth();
    const body = await parseJsonBody(request, updateUserSchema);
    const profile = await updateUserProfile(user.id, body);
    return jsonSuccess(profile);
  });
}

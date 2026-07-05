import { getUserProfile } from "@/lib/repositories/auth.repository";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const user = await getCurrentSessionUser();
    if (!user) {
      throw new ApiHttpError(401, "UNAUTHORIZED", "غير مسجل الدخول.");
    }

    const profile = await getUserProfile(user.id);
    return jsonSuccess(profile);
  });
}

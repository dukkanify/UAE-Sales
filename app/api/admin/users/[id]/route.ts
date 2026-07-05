import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { enforceAdminRateLimit } from "@/lib/api/admin-rate-limit";
import { adminUserPatchSchema, parseJsonBody } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminUserInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminUser } from "@/mock/admin.mock";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const admin = await requireAdmin();
    await enforceAdminRateLimit(request, "users-patch", admin.id);
    const { id } = await context.params;
    const patch = await parseJsonBody(request, adminUserPatchSchema);

    const user = await withDataFallback(
      () => patchAdminUserInDb(id, patch),
      async () => patchMockAdminUser(id, patch) ?? undefined,
      "admin-user-patch",
    );

    if (!user) {
      throw new ApiHttpError(404, "NOT_FOUND", "المستخدم غير موجود.");
    }

    return jsonSuccess(user);
  });
}

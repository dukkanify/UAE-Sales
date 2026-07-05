import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminUserInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminUser } from "@/mock/admin.mock";
import type { AdminUserPatch } from "@/types/domain/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { id } = await context.params;
    const patch = (await request.json()) as AdminUserPatch;

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

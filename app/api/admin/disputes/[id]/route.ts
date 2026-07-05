import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminDisputeInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminDispute } from "@/mock/admin.mock";
import type { AdminDisputePatch } from "@/types/domain/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { id } = await context.params;
    const patch = (await request.json()) as AdminDisputePatch;

    const dispute = await withDataFallback(
      () => patchAdminDisputeInDb(id, patch),
      async () => patchMockAdminDispute(id, patch) ?? undefined,
      "admin-dispute-patch",
    );

    if (!dispute) {
      throw new ApiHttpError(404, "NOT_FOUND", "النزاع غير موجود.");
    }

    return jsonSuccess(dispute);
  });
}

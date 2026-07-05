import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { enforceAdminRateLimit } from "@/lib/api/admin-rate-limit";
import { adminDisputePatchSchema, parseJsonBody } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminDisputeInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminDispute } from "@/mock/admin.mock";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const admin = await requireAdmin();
    await enforceAdminRateLimit(request, "disputes-patch", admin.id);
    const { id } = await context.params;
    const patch = await parseJsonBody(request, adminDisputePatchSchema);

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

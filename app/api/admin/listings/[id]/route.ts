import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { enforceAdminRateLimit } from "@/lib/api/admin-rate-limit";
import { adminListingPatchSchema, parseJsonBody } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminListingInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminListing } from "@/mock/admin.mock";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const admin = await requireAdmin();
    await enforceAdminRateLimit(request, "listings-patch", admin.id);
    const { id } = await context.params;
    const patch = await parseJsonBody(request, adminListingPatchSchema);

    const listing = await withDataFallback(
      () => patchAdminListingInDb(id, patch),
      async () => patchMockAdminListing(id, patch) ?? undefined,
      "admin-listing-patch",
    );

    if (!listing) {
      throw new ApiHttpError(404, "NOT_FOUND", "الإعلان غير موجود.");
    }

    return jsonSuccess(listing);
  });
}

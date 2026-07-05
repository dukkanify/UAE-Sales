import { requireAdmin } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { patchAdminListingInDb } from "@/lib/repositories/admin.repository";
import { patchMockAdminListing } from "@/mock/admin.mock";
import type { AdminListingPatch } from "@/types/domain/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { id } = await context.params;
    const patch = (await request.json()) as AdminListingPatch;

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

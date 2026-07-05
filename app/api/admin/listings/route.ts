import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminListingsFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminListings } from "@/mock/admin.mock";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      emirate: searchParams.get("emirate") ?? undefined,
    };

    const listings = await withDataFallback(
      () => getAdminListingsFromDb(filters),
      () => getMockAdminListings(filters),
      "admin-listings-api",
    );

    return jsonSuccess(listings);
  });
}

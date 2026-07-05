import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminEscrowFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminEscrow } from "@/mock/admin.mock";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ?? undefined,
    };

    const escrow = await withDataFallback(
      () => getAdminEscrowFromDb(filters),
      () => getMockAdminEscrow(filters),
      "admin-escrow-api",
    );

    return jsonSuccess(escrow);
  });
}

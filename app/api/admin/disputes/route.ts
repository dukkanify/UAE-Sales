import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminDisputesFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminDisputes } from "@/mock/admin.mock";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ?? undefined,
    };

    const disputes = await withDataFallback(
      () => getAdminDisputesFromDb(filters),
      () => getMockAdminDisputes(filters),
      "admin-disputes-api",
    );

    return jsonSuccess(disputes);
  });
}

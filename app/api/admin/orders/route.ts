import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminOrdersFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminOrders } from "@/mock/admin.mock";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get("status") ?? undefined,
    };

    const orders = await withDataFallback(
      () => getAdminOrdersFromDb(filters),
      () => getMockAdminOrders(filters),
      "admin-orders-api",
    );

    return jsonSuccess(orders);
  });
}

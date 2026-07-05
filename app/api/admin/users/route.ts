import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminUsersFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminUsers } from "@/mock/admin.mock";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      query: searchParams.get("query") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      verified: searchParams.get("verified") ?? undefined,
    };

    const users = await withDataFallback(
      () => getAdminUsersFromDb(filters),
      () => getMockAdminUsers(filters),
      "admin-users-api",
    );

    return jsonSuccess(users);
  });
}

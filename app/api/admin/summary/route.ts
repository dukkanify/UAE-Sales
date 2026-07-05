import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminSummaryFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminSummary } from "@/mock/admin.mock";

export async function GET() {
  return handleApiRoute(async () => {
    await requireAdmin();
    const summary = await withDataFallback(
      getAdminSummaryFromDb,
      getMockAdminSummary,
      "admin-summary-api",
    );
    return jsonSuccess(summary);
  });
}

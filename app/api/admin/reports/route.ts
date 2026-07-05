import { requireAdmin } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getAdminReportsFromDb } from "@/lib/repositories/admin.repository";
import { getMockAdminReports } from "@/mock/admin.mock";

export async function GET() {
  return handleApiRoute(async () => {
    await requireAdmin();
    const reports = await withDataFallback(
      getAdminReportsFromDb,
      getMockAdminReports,
      "admin-reports-api",
    );
    return jsonSuccess(reports);
  });
}

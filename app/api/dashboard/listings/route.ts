import { getUserListingsFromDb } from "@/lib/repositories/listings.repository";
import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(503, "SERVER_ERROR", "قاعدة البيانات غير مهيأة.");
    }

    const user = await requireAuth();
    const listings = await getUserListingsFromDb(user.id);
    return jsonSuccess(listings);
  });
}

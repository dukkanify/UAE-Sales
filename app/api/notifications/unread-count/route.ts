import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getUnreadNotificationsCountFromDb } from "@/lib/repositories/notifications.repository";
import { getMockUnreadNotificationsCount } from "@/mock/notifications.mock";

export async function GET() {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const count = await withDataFallback(
      () => getUnreadNotificationsCountFromDb(user.id),
      getMockUnreadNotificationsCount,
      "notifications-unread-count-api",
    );
    return jsonSuccess({ count });
  });
}

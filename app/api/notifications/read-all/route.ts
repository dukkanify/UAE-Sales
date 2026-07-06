import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { markAllNotificationsReadInDb } from "@/lib/repositories/notifications.repository";
import { markAllMockNotificationsRead } from "@/mock/notifications.mock";

export async function PATCH() {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const notifications = await withDataFallback(
      () => markAllNotificationsReadInDb(user.id),
      markAllMockNotificationsRead,
      "notifications-read-all",
    );
    return jsonSuccess(notifications);
  });
}

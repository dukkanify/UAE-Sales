import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getNotificationsFromDb,
  seedNotificationsForUser,
} from "@/lib/repositories/notifications.repository";
import { getMockNotifications } from "@/mock/notifications.mock";

export async function GET() {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const notifications = await withDataFallback(
      async () => {
        await seedNotificationsForUser(user.id);
        return getNotificationsFromDb(user.id);
      },
      getMockNotifications,
      "notifications-api",
    );
    return jsonSuccess(notifications);
  });
}

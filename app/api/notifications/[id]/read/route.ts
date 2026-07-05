import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { markNotificationReadInDb } from "@/lib/repositories/notifications.repository";
import { markMockNotificationRead } from "@/mock/notifications.mock";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const { id } = await context.params;

    const notification = await withDataFallback(
      () => markNotificationReadInDb(user.id, id),
      () => markMockNotificationRead(id),
      "notification-read",
    );

    if (!notification) {
      throw new ApiHttpError(404, "NOT_FOUND", "الإشعار غير موجود.");
    }

    return jsonSuccess(notification);
  });
}

import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listNotifications } from "@/services/notifications/notification-service";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  const url = new URL(request.url);
  return ok(
    listNotifications(ctx.user.id, {
      page: Number(url.searchParams.get("page") ?? 1),
      pageSize: Number(url.searchParams.get("pageSize") ?? 20),
    }),
  );
});

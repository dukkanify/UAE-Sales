import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listNotifications } from "@/services/notifications/notification-service";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  const p = parsePagination(new URL(request.url));
  return ok(
    listNotifications(ctx.user.id, {
      page: p.page,
      pageSize: p.pageSize,
    }),
  );
});

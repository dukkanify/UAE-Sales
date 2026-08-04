import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listLiveClasses } from "@/services/classes/class-service";

export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  const url = new URL(request.url);
  const p = parsePagination(url);
  return ok(
    listLiveClasses({
      q: p.q,
      page: p.page,
      pageSize: p.pageSize,
      status: (url.searchParams.get("status") as "all") ?? "all",
    }),
  );
});

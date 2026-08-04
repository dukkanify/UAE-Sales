import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination, paginate } from "@/lib/api/envelope";
import { requirePublicOrAuth } from "@/lib/api/auth";
import { cacheWrap } from "@/services/api-platform/cache-service";
import { listAnnouncements } from "@/services/communication/announcement-service";

export const GET = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  const url = new URL(request.url);
  const p = parsePagination(url);
  const data = cacheWrap(`v1:public:announcements:${p.page}`, 30, ["announcements", "public"], () => {
    const rows = listAnnouncements({ status: "published" });
    return paginate(rows, p.page, p.pageSize);
  });
  return ok(data, { meta: { rateLimit: "60/min/ip" } });
});

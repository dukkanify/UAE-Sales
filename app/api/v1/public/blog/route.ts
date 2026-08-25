import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination, paginate } from "@/lib/api/envelope";
import { requirePublicOrAuth } from "@/lib/api/auth";
import { cacheWrap } from "@/services/api-platform/cache-service";
import { listBlogPosts } from "@/services/communication/blog-service";

export const GET = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  const url = new URL(request.url);
  const p = parsePagination(url);
  const data = cacheWrap(`v1:public:blog:${p.page}:${p.q ?? ""}`, 60, ["blog", "public"], () => {
    const posts = listBlogPosts({ status: "published", q: p.q });
    return paginate(posts, p.page, p.pageSize);
  });
  return ok(data, {
    meta: { rateLimit: "60/min/ip" },
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
    },
  });
});

import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination } from "@/lib/api/envelope";
import { requirePublicOrAuth } from "@/lib/api/auth";
import { cacheWrap } from "@/services/api-platform/cache-service";
import {
  applyDueScheduledPublishes,
  isPublicCatalogFixture,
  listCourses,
} from "@/services/courses/course-service";
import { getPublicDeliveryFilter, isCoursePubliclyListed } from "@/services/courses/publishing";
import { ensureCoursesSeeded } from "@/services/courses/seed";

export const GET = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  ensureCoursesSeeded();
  applyDueScheduledPublishes();
  const url = new URL(request.url);
  const p = parsePagination(url);
  const deliveryFilter = getPublicDeliveryFilter();
  const data = cacheWrap(
    `v1:public:courses:${p.page}:${p.pageSize}:${p.q ?? ""}:${p.sortBy ?? ""}:${p.sortDir}:${deliveryFilter}`,
    30,
    ["courses", "public"],
    () => {
      // Pull a wide published page, apply visibility rules, then paginate.
      const published = listCourses({
        q: p.q,
        status: "published",
        page: 1,
        pageSize: 200,
        sortBy: (p.sortBy as "updatedAt" | "title" | "createdAt") ?? "updatedAt",
        sortDir: p.sortDir,
      });
      const filtered = published.data.filter(
        (c) => !isPublicCatalogFixture(c) && isCoursePubliclyListed(c, { deliveryFilter }),
      );
      const start = (p.page - 1) * p.pageSize;
      const slice = filtered.slice(start, start + p.pageSize);
      return {
        ...published,
        data: slice,
        page: p.page,
        pageSize: p.pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / p.pageSize)),
      };
    },
  );
  return ok(data, {
    meta: { cache: "public-courses-30s", rateLimit: "60/min/ip" },
  });
});

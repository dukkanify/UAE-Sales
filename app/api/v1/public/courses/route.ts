import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination } from "@/lib/api/envelope";
import { requirePublicOrAuth } from "@/lib/api/auth";
import { cacheWrap } from "@/services/api-platform/cache-service";
import { listCourses } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";

export const GET = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  ensureCoursesSeeded();
  const url = new URL(request.url);
  const p = parsePagination(url);
  const data = cacheWrap(
    `v1:public:courses:${p.page}:${p.pageSize}:${p.q ?? ""}`,
    30,
    ["courses", "public"],
    () => {
      const result = listCourses({
        q: p.q,
        status: "published",
        page: p.page,
        pageSize: p.pageSize,
        sortBy: (p.sortBy as "updatedAt" | "title" | "createdAt") ?? "updatedAt",
        sortDir: p.sortDir,
      });
      return result;
    },
  );
  return ok(data, {
    meta: { cache: "public-courses-30s", rateLimit: "60/min/ip" },
  });
});

import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/services/auth/permissions";
import { listCourses } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ROLES } from "@/constants/roles";
import type { CourseStatus } from "@/types/courses";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  ensureCoursesSeeded();
  const url = new URL(request.url);
  const p = parsePagination(url);
  const filters = {
    q: p.q,
    page: p.page,
    pageSize: p.pageSize,
    sortBy: (p.sortBy as "updatedAt" | "title" | "createdAt") ?? "updatedAt",
    sortDir: p.sortDir,
    status: (url.searchParams.get("status") as CourseStatus | "all") ?? "all",
    instructorId:
      ctx.user.role === ROLES.INSTRUCTOR
        ? ctx.user.id
        : url.searchParams.get("instructorId") ?? undefined,
  };
  if (
    ctx.user.role !== ROLES.STUDENT &&
    !hasPermission(ctx.user.role, PERMISSIONS.COURSES_MANAGE) &&
    !hasPermission(ctx.user.role, PERMISSIONS.COURSES_OWN)
  ) {
    // students use learning APIs; still allow published list via catalog semantics
  }
  return ok(listCourses(filters));
});

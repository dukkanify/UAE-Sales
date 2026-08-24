import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import { listCourses } from "@/services/courses/course-service";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { CourseListItem, CourseStatus } from "@/types/courses";

/**
 * Read-only catalog for instructors (assigned) and students (enrolled).
 * Students cannot mutate course content through this endpoint.
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    ensureCoursesSeeded();
    const { searchParams } = new URL(request.url);
    const pageSize = Number(searchParams.get("pageSize") ?? 50);

    if (user.role === ROLES.STUDENT) {
      assertPermission(user, PERMISSIONS.COURSES_ENROLLED);
      const enrollments = listStudentEnrollments(user.id).filter((e) =>
        ["approved", "completed", "pending"].includes(e.status),
      );
      const all = listCourses({ pageSize: 500 }).data;
      const byId = new Map(all.map((c) => [c.id, c]));
      const data: CourseListItem[] = [];
      for (const e of enrollments) {
        const course = byId.get(e.courseId);
        if (course) data.push(course);
      }
      return NextResponse.json({
        success: true,
        data: {
          data: data.slice(0, pageSize),
          total: data.length,
          page: 1,
          pageSize,
          totalPages: 1,
        },
        error: null,
      });
    }

    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.COURSES_OWN);
      const result = listCourses({
        instructorId: user.id,
        pageSize,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }

    assertPermission(user, PERMISSIONS.COURSES_MANAGE);
    const statusParam = searchParams.get("status");
    const instructorId = searchParams.get("instructorId") ?? undefined;
    const result = listCourses({
      status: (statusParam as CourseStatus | "all" | null) ?? "all",
      instructorId,
      pageSize,
    });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import {
  authErrorResponse,
  getRequestContext,
  requireAuth,
  requirePermission,
} from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import { createCourse, listCourses } from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import { parsePagination } from "@/lib/api/envelope";
import type { CourseFilters, CourseStatus, DifficultyLevel, EnrollmentMode } from "@/types/courses";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const { searchParams } = url;
    const p = parsePagination(url, { pageSize: 12 });
    const filters: CourseFilters = {
      q: p.q,
      instructorId: searchParams.get("instructorId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      status: (searchParams.get("status") as CourseStatus | "all" | null) ?? "all",
      difficulty: (searchParams.get("difficulty") as DifficultyLevel | "all" | null) ?? "all",
      enrollmentMode:
        (searchParams.get("enrollmentMode") as EnrollmentMode | "all" | null) ?? "all",
      code: searchParams.get("code") ?? undefined,
      publishedFrom: searchParams.get("publishedFrom") ?? undefined,
      publishedTo: searchParams.get("publishedTo") ?? undefined,
      page: p.page,
      pageSize: p.pageSize,
      sortBy: (p.sortBy as CourseFilters["sortBy"]) ?? "updatedAt",
      sortDir: p.sortDir,
    };

    // Admins manage the full catalog; instructors only list courses they own.
    if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
      assertPermission(user, PERMISSIONS.COURSES_MANAGE);
    } else if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.COURSES_OWN);
      filters.instructorId = user.id;
    } else {
      throw new PermissionError("You do not have permission to perform this action", 403);
    }

    const result = listCourses(filters);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);
    const course = await createCourse({
      title: String(body.title ?? ""),
      shortDescription: body.shortDescription != null ? String(body.shortDescription) : undefined,
      fullDescription: body.fullDescription != null ? String(body.fullDescription) : undefined,
      code: String(body.code ?? ""),
      categoryId: (body.categoryId as string | null | undefined) ?? null,
      thumbnailUrl: (body.thumbnailUrl as string | null | undefined) ?? null,
      coverImageUrl: (body.coverImageUrl as string | null | undefined) ?? null,
      previewVideoUrl: (body.previewVideoUrl as string | null | undefined) ?? null,
      difficulty: body.difficulty != null ? String(body.difficulty) : undefined,
      language: body.language != null ? String(body.language) : undefined,
      estimatedDurationMinutes:
        body.estimatedDurationMinutes != null ? Number(body.estimatedDurationMinutes) : undefined,
      enrollmentMode: body.enrollmentMode != null ? String(body.enrollmentMode) : undefined,
      status: body.status != null ? String(body.status) : undefined,
      scheduledPublishAt: (body.scheduledPublishAt as string | null | undefined) ?? null,
      primaryInstructorId: (body.primaryInstructorId as string | null | undefined) ?? null,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: course, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

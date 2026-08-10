import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { PermissionError } from "@/services/auth/permissions";
import { bulkCourseAction } from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { BulkCourseAction } from "@/types/courses";

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const body = (await request.json().catch(() => null)) as {
      action?: BulkCourseAction;
      courseIds?: string[];
      instructorId?: string;
      categoryId?: string | null;
    } | null;

    if (!body?.action || !Array.isArray(body.courseIds)) {
      return NextResponse.json(
        { success: false, data: null, error: "action and courseIds required" },
        { status: 400 },
      );
    }

    if (
      (body.action === "publish" || body.action === "archive") &&
      user.role !== ROLES.SUPER_ADMIN
    ) {
      throw new PermissionError("Only Super Admin can bulk publish or archive courses", 403);
    }

    const ctx = getRequestContext(request);
    const result = await bulkCourseAction({
      action: body.action,
      courseIds: body.courseIds,
      instructorId: body.instructorId,
      categoryId: body.categoryId,
      actorId: user.id,
      ...ctx,
    });

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

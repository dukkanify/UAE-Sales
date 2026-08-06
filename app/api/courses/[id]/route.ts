import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requireAuth } from "@/services/auth/guards";
import { hasPermission, PermissionError } from "@/services/auth/permissions";
import {
  getCourseDetail,
  instructorOwnsCourse,
  softDeleteCourse,
  updateCourse,
} from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { Role } from "@/constants/roles";

type Params = { params: Promise<{ id: string }> };

function assertCanMutateCourse(userId: string, role: Role, courseId: string) {
  if (hasPermission(role, PERMISSIONS.COURSES_MANAGE)) return;
  if (!hasPermission(role, PERMISSIONS.COURSES_OWN)) {
    throw new PermissionError("You do not have permission to perform this action", 403);
  }
  if (!instructorOwnsCourse(userId, courseId)) {
    throw new PermissionError("You can only manage your own courses", 403);
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const detail = getCourseDetail(id);
    if (!detail) {
      return NextResponse.json(
        { success: false, data: null, error: "Course not found" },
        { status: 404 },
      );
    }

    if (hasPermission(user.role, PERMISSIONS.COURSES_MANAGE)) {
      return NextResponse.json({ success: true, data: detail, error: null });
    }

    if (hasPermission(user.role, PERMISSIONS.COURSES_OWN) && instructorOwnsCourse(user.id, id)) {
      return NextResponse.json({ success: true, data: detail, error: null });
    }

    throw new PermissionError("You do not have permission to perform this action", 403);
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    assertCanMutateCourse(user.id, user.role, id);

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }

    const canManage = hasPermission(user.role, PERMISSIONS.COURSES_MANAGE);
    const patch = { ...body };
    if (!canManage) {
      // Instructors cannot reassign ownership away from themselves.
      patch.primaryInstructorId = user.id;
    }

    const ctx = getRequestContext(request);
    const course = await updateCourse({
      id,
      patch,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: course, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    assertCanMutateCourse(user.id, user.role, id);
    const ctx = getRequestContext(request);
    await softDeleteCourse(id, user.id, ctx);
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

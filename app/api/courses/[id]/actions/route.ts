import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth, requirePermission } from "@/services/auth/guards";
import { hasPermission, PermissionError } from "@/services/auth/permissions";
import {
  archiveCourse,
  assignInstructor,
  duplicateCourse,
  publishCourse,
  unpublishCourse,
} from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

type Params = { params: Promise<{ id: string }> };

function assertSuperAdminPublishing(role: string) {
  if (role !== ROLES.SUPER_ADMIN) {
    throw new PermissionError("Only Super Admin can publish, unpublish, or archive courses", 403);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      userId?: string;
      role?: "primary" | "assistant";
    };
    const ctx = getRequestContext(request);
    const action = body.action;

    if (action === "assign_instructor") {
      if (
        !hasPermission(user.role, PERMISSIONS.COURSES_MANAGE) &&
        !hasPermission(user.role, PERMISSIONS.INSTRUCTORS_ASSIGN)
      ) {
        throw new PermissionError("You do not have permission to assign instructors", 403);
      }
      if (!body.userId) {
        return NextResponse.json(
          { success: false, data: null, error: "userId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await assignInstructor({
          courseId: id,
          userId: body.userId,
          role: body.role ?? "primary",
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    await requirePermission(PERMISSIONS.COURSES_MANAGE);

    if (action === "publish") {
      assertSuperAdminPublishing(user.role);
      return NextResponse.json({
        success: true,
        data: await publishCourse(id, user.id, ctx),
        error: null,
      });
    }
    if (action === "unpublish") {
      assertSuperAdminPublishing(user.role);
      return NextResponse.json({
        success: true,
        data: await unpublishCourse(id, user.id, ctx),
        error: null,
      });
    }
    if (action === "archive") {
      assertSuperAdminPublishing(user.role);
      return NextResponse.json({
        success: true,
        data: await archiveCourse(id, user.id, ctx),
        error: null,
      });
    }
    if (action === "duplicate") {
      return NextResponse.json({
        success: true,
        data: await duplicateCourse(id, user.id, ctx),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return courseErrorResponse(error);
  }
}

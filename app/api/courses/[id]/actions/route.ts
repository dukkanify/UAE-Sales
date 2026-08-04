import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import {
  archiveCourse,
  assignInstructor,
  duplicateCourse,
  publishCourse,
  unpublishCourse,
} from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      userId?: string;
      role?: "primary" | "assistant";
    };
    const ctx = getRequestContext(request);
    const action = body.action;

    if (action === "publish") {
      return NextResponse.json({
        success: true,
        data: await publishCourse(id, user.id, ctx),
        error: null,
      });
    }
    if (action === "unpublish") {
      return NextResponse.json({
        success: true,
        data: await unpublishCourse(id, user.id, ctx),
        error: null,
      });
    }
    if (action === "archive") {
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
    if (action === "assign_instructor") {
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

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return courseErrorResponse(error);
  }
}

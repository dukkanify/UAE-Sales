import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  createStudySession,
  listStudySessions,
} from "@/services/learning/planner-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET() {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    return NextResponse.json({
      success: true,
      data: listStudySessions(user.id),
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const body = (await request.json().catch(() => null)) as {
      title?: string;
      courseId?: string | null;
      lessonId?: string | null;
      scheduledStart?: string;
      scheduledEnd?: string;
      notes?: string;
    } | null;
    if (!body?.title || !body.scheduledStart || !body.scheduledEnd) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "title, scheduledStart, and scheduledEnd required",
        },
        { status: 400 },
      );
    }
    const data = await createStudySession({
      user,
      title: body.title,
      courseId: body.courseId,
      lessonId: body.lessonId,
      scheduledStart: body.scheduledStart,
      scheduledEnd: body.scheduledEnd,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

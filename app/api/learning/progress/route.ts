import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  completeLessonProgress,
  touchLessonProgress,
} from "@/services/learning/progress-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const body = (await request.json().catch(() => null)) as {
      courseId?: string;
      lessonId?: string;
      deltaSeconds?: number;
      resumePosition?: number;
      complete?: boolean;
    } | null;

    if (!body?.courseId || !body?.lessonId) {
      return NextResponse.json(
        { success: false, data: null, error: "courseId and lessonId required" },
        { status: 400 },
      );
    }

    if (body.complete) {
      const data = await completeLessonProgress({
        user,
        courseId: body.courseId,
        lessonId: body.lessonId,
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    const data = await touchLessonProgress({
      user,
      courseId: body.courseId,
      lessonId: body.lessonId,
      deltaSeconds: body.deltaSeconds,
      resumePosition: body.resumePosition,
      markStarted: true,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

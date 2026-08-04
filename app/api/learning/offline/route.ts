import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { assertStudentEnrolled } from "@/services/learning/access";
import {
  listOfflineCache,
  registerOfflineCache,
} from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET() {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    return NextResponse.json({
      success: true,
      data: listOfflineCache(user.id),
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
      courseId?: string;
      lessonId?: string;
      contentVersion?: string;
      sizeBytes?: number | null;
    } | null;
    if (!body?.courseId || !body.lessonId) {
      return NextResponse.json(
        { success: false, data: null, error: "courseId and lessonId required" },
        { status: 400 },
      );
    }
    assertStudentEnrolled(user, body.courseId);
    const data = registerOfflineCache({
      studentId: user.id,
      courseId: body.courseId,
      lessonId: body.lessonId,
      contentVersion: body.contentVersion,
      sizeBytes: body.sizeBytes,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

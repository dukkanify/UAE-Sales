import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { listResourceLibrary } from "@/services/learning/learning-service";
import { recordResourceDownload } from "@/services/learning/progress-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { searchParams } = new URL(request.url);
    const data = listResourceLibrary(user.id, {
      q: searchParams.get("q") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const body = (await request.json().catch(() => null)) as {
      courseId?: string;
      lessonId?: string | null;
      resourceId?: string;
      title?: string;
    } | null;
    if (!body?.courseId || !body.resourceId || !body.title) {
      return NextResponse.json(
        { success: false, data: null, error: "courseId, resourceId, title required" },
        { status: 400 },
      );
    }
    await recordResourceDownload({
      user,
      courseId: body.courseId,
      lessonId: body.lessonId,
      resourceId: body.resourceId,
      title: body.title,
    });
    return NextResponse.json({ success: true, data: { ok: true }, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

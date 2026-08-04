import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { uploadCourseMedia, type CourseMediaKind } from "@/services/courses/media-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

const KINDS: CourseMediaKind[] = ["thumbnail", "cover", "video", "attachment"];

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") ?? "attachment") as CourseMediaKind;
    const courseId = form.get("courseId") ? String(form.get("courseId")) : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, data: null, error: "file is required" },
        { status: 400 },
      );
    }
    if (!KINDS.includes(kind)) {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid media kind" },
        { status: 400 },
      );
    }

    const ctx = getRequestContext(request);
    const result = await uploadCourseMedia({
      file,
      kind,
      courseId,
      actorId: user.id,
      ...ctx,
    });

    return NextResponse.json({ success: true, data: result, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

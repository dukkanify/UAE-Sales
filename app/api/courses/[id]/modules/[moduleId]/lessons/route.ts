import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { createLesson, listLessons } from "@/services/courses/lesson-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { ContentStatus } from "@/types/courses";

type Params = { params: Promise<{ id: string; moduleId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { moduleId } = await params;
    return NextResponse.json({
      success: true,
      data: listLessons(moduleId),
      error: null,
    });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id, moduleId } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);
    const lesson = await createLesson({
      courseId: id,
      moduleId,
      title: String(body.title ?? ""),
      description: body.description != null ? String(body.description) : undefined,
      contentHtml: body.contentHtml != null ? String(body.contentHtml) : undefined,
      videoUrl: (body.videoUrl as string | null | undefined) ?? null,
      durationMinutes:
        body.durationMinutes != null ? Number(body.durationMinutes) : undefined,
      estimatedStudyMinutes:
        body.estimatedStudyMinutes != null
          ? Number(body.estimatedStudyMinutes)
          : undefined,
      order: body.order != null ? Number(body.order) : undefined,
      previewAvailable:
        body.previewAvailable != null ? Boolean(body.previewAvailable) : undefined,
      status: body.status as ContentStatus | undefined,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: lesson, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import {
  addResource,
  deleteLesson,
  getLesson,
  removeResource,
  updateLesson,
} from "@/services/courses/lesson-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { ResourceType } from "@/types/courses";

type Params = { params: Promise<{ id: string; lessonId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { lessonId } = await params;
    const lesson = getLesson(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { success: false, data: null, error: "Lesson not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: lesson, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { lessonId } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);

    if (body.action === "add_resource") {
      const resource = await addResource({
        lessonId,
        title: String(body.title ?? ""),
        type: body.type as ResourceType,
        url: String(body.url ?? ""),
        fileName: (body.fileName as string | null | undefined) ?? null,
        mimeType: (body.mimeType as string | null | undefined) ?? null,
        sizeBytes: body.sizeBytes != null ? Number(body.sizeBytes) : null,
        downloadable: body.downloadable != null ? Boolean(body.downloadable) : undefined,
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({ success: true, data: resource, error: null }, { status: 201 });
    }

    if (body.action === "remove_resource") {
      await removeResource({
        id: String(body.resourceId ?? ""),
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({
        success: true,
        data: { id: body.resourceId },
        error: null,
      });
    }

    const lesson = await updateLesson({
      id: lessonId,
      patch: body,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: lesson, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { lessonId } = await params;
    const ctx = getRequestContext(request);
    await deleteLesson({ id: lessonId, actorId: user.id, ...ctx });
    return NextResponse.json({ success: true, data: { id: lessonId }, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

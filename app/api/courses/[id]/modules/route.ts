import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { createModule, listModules, reorderModules } from "@/services/courses/module-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { ContentStatus } from "@/types/courses";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    return NextResponse.json({
      success: true,
      data: listModules(id),
      error: null,
    });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);

    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      const modules = await reorderModules({
        courseId: id,
        orderedIds: body.orderedIds.map(String),
        actorId: user.id,
      });
      return NextResponse.json({ success: true, data: modules, error: null });
    }

    const mod = await createModule({
      courseId: id,
      title: String(body.title ?? ""),
      description: body.description != null ? String(body.description) : undefined,
      order: body.order != null ? Number(body.order) : undefined,
      estimatedDurationMinutes:
        body.estimatedDurationMinutes != null
          ? Number(body.estimatedDurationMinutes)
          : undefined,
      status: body.status as ContentStatus | undefined,
      visible: body.visible != null ? Boolean(body.visible) : undefined,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: mod, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

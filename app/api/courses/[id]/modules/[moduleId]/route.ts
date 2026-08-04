import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { deleteModule, updateModule } from "@/services/courses/module-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

type Params = { params: Promise<{ id: string; moduleId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { moduleId } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);
    const mod = await updateModule({
      id: moduleId,
      patch: body,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: mod, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { moduleId } = await params;
    const ctx = getRequestContext(request);
    await deleteModule({ id: moduleId, actorId: user.id, ...ctx });
    return NextResponse.json({ success: true, data: { id: moduleId }, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

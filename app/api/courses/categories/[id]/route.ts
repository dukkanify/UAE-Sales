import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { deleteCategory, updateCategory } from "@/services/courses/category-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
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
    const category = await updateCategory({
      id,
      patch: body,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: category, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    const ctx = getRequestContext(request);
    await deleteCategory({ id, actorId: user.id, ...ctx });
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

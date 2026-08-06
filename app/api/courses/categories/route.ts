import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requireAuth, requirePermission } from "@/services/auth/guards";
import { hasPermission, PermissionError } from "@/services/auth/permissions";
import {
  createCategory,
  getCategoryTree,
  listCategories,
} from "@/services/courses/category-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const canManage = hasPermission(user.role, PERMISSIONS.COURSES_MANAGE);
    const canOwn = hasPermission(user.role, PERMISSIONS.COURSES_OWN);
    if (!canManage && !canOwn) {
      throw new PermissionError("You do not have permission to perform this action", 403);
    }

    const { searchParams } = new URL(request.url);
    const tree = searchParams.get("tree") === "1";
    // Instructors only see visible categories; admins may include hidden.
    const includeHidden = canManage && searchParams.get("includeHidden") === "1";
    const data = tree ? getCategoryTree({ includeHidden }) : listCategories({ includeHidden });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);
    const category = await createCategory({
      name: String(body.name ?? ""),
      description: body.description != null ? String(body.description) : undefined,
      parentId: (body.parentId as string | null | undefined) ?? null,
      icon: body.icon != null ? String(body.icon) : undefined,
      order: body.order != null ? Number(body.order) : undefined,
      visible: body.visible != null ? Boolean(body.visible) : undefined,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: category, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

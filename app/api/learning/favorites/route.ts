import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { addFavorite, listFavorites } from "@/services/learning/bookmark-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";
import type { FavoriteTargetType } from "@/types/learning";

export async function GET() {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    return NextResponse.json({
      success: true,
      data: listFavorites(user.id),
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
      targetType?: FavoriteTargetType;
      targetId?: string;
      courseId?: string | null;
      label?: string;
    } | null;
    if (!body?.targetType || !body.targetId) {
      return NextResponse.json(
        { success: false, data: null, error: "targetType and targetId required" },
        { status: 400 },
      );
    }
    const data = await addFavorite({
      user,
      targetType: body.targetType,
      targetId: body.targetId,
      courseId: body.courseId,
      label: body.label ?? "Favorite",
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

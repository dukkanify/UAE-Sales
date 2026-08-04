import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { removeFavorite } from "@/services/learning/bookmark-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { id } = await context.params;
    await removeFavorite(user, id);
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

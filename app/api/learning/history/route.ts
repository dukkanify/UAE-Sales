import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { listHistory } from "@/services/learning/history-service";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    ensureLearningSeeded();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? 50);
    return NextResponse.json({
      success: true,
      data: listHistory(user.id, { limit }),
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { searchLearning } from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const q = new URL(request.url).searchParams.get("q") ?? "";
    return NextResponse.json({
      success: true,
      data: searchLearning(user.id, q),
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

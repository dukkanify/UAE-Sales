import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getLearningCalendar } from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET() {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    return NextResponse.json({
      success: true,
      data: getLearningCalendar(user.id),
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

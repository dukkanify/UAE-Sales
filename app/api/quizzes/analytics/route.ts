import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  getPlatformAssessmentOverview,
  getQuizAnalytics,
} from "@/services/quizzes/analytics-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

export async function GET(request: Request) {
  try {
    ensureQuizzesSeeded();
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const quizId = new URL(request.url).searchParams.get("quizId");
    if (quizId) {
      return NextResponse.json({
        success: true,
        data: getQuizAnalytics(quizId),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: getPlatformAssessmentOverview(),
      error: null,
    });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

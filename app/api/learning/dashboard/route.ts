import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { agentLog } from "@/lib/debug/agent-log";
import { requirePermission } from "@/services/auth/guards";
import { getLearningDashboard } from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET() {
  // #region agent log
  agentLog({
    hypothesisId: "A",
    location: "api/learning/dashboard/route.ts",
    message: "GET /api/learning/dashboard entry",
    data: {},
  });
  // #endregion
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const data = getLearningDashboard(user);
    // #region agent log
    agentLog({
      hypothesisId: "A",
      location: "api/learning/dashboard/route.ts",
      message: "GET /api/learning/dashboard success",
      data: { activeCourses: data.activeCourses },
    });
    // #endregion
    return NextResponse.json({
      success: true,
      data,
      error: null,
    });
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "A",
      location: "api/learning/dashboard/route.ts",
      message: "GET /api/learning/dashboard THREW",
      data: {
        code:
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "",
        errMessage: error instanceof Error ? error.message : String(error),
      },
    });
    // #endregion
    return learningErrorResponse(error);
  }
}

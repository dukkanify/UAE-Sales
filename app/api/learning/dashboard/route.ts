import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  emptyLearningDashboardOverview,
  getLearningDashboard,
} from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";
import { writeOpsLog } from "@/services/ops/logging-service";
import { newDashboardCorrelationId } from "@/lib/dashboard/safe-load";

export async function GET() {
  const correlationId = newDashboardCorrelationId();
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const data = getLearningDashboard(user);
    return NextResponse.json({
      success: true,
      data,
      error: null,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    // Auth failures stay as API errors; data-path failures return empty overview.
    if (
      errMessage.toLowerCase().includes("auth") ||
      errMessage.toLowerCase().includes("permission") ||
      errMessage.toLowerCase().includes("forbidden") ||
      errMessage.toLowerCase().includes("csrf")
    ) {
      return learningErrorResponse(error);
    }
    writeOpsLog({
      level: "error",
      category: "error",
      message: "GET /api/learning/dashboard failed — serving empty overview",
      path: "/api/learning/dashboard",
      details: {
        correlationId,
        errMessage,
        stack: error instanceof Error ? error.stack?.slice(0, 4000) : null,
        timestamp: new Date().toISOString(),
      },
    });
    return NextResponse.json({
      success: true,
      data: emptyLearningDashboardOverview(),
      error: null,
      meta: { degraded: true, correlationId },
    });
  }
}

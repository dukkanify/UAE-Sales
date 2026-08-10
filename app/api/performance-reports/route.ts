import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import {
  getPerformanceReportsOverview,
  listPerformanceReports,
  PerformanceReportError,
} from "@/services/performance/report-service";

function errorResponse(error: unknown) {
  if (error instanceof PerformanceReportError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Request failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

/** List performance reports for the caller's scope (student / instructor / Super Admin). */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (user.role === ROLES.STUDENT) {
      return NextResponse.json({
        success: true,
        data: listPerformanceReports({ studentId: user.id }),
        error: null,
      });
    }

    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.REPORTS_OWN);
      return NextResponse.json({
        success: true,
        data: listPerformanceReports({ instructorId: user.id }),
        error: null,
      });
    }

    if (user.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.REPORTS_VIEW);
    } else {
      assertPermission(user, PERMISSIONS.REPORTS_VIEW);
    }

    if (view === "overview") {
      return NextResponse.json({
        success: true,
        data: getPerformanceReportsOverview(),
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: listPerformanceReports({
        studentId: searchParams.get("studentId") ?? undefined,
        instructorId: searchParams.get("instructorId") ?? undefined,
        liveClassId: searchParams.get("liveClassId") ?? undefined,
        courseId: searchParams.get("courseId") ?? undefined,
      }),
      error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

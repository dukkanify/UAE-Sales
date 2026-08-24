import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { assertOwnOrManage } from "@/services/certificates/access";
import {
  getAcademicPerformance,
  getProgressTimeline,
  getStudentProgressSnapshot,
} from "@/services/certificates/progress-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const studentId =
      searchParams.get("studentId") ||
      (user.role === ROLES.STUDENT ? user.id : null);
    if (!studentId) {
      return NextResponse.json(
        { success: false, data: null, error: "studentId required" },
        { status: 400 },
      );
    }
    assertOwnOrManage(user, studentId);
    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.CERTIFICATES_OWN);
    }

    const view = searchParams.get("view") ?? "snapshot";
    if (view === "academic") {
      return NextResponse.json({
        success: true,
        data: getAcademicPerformance(studentId),
        error: null,
      });
    }
    if (view === "timeline") {
      return NextResponse.json({
        success: true,
        data: getProgressTimeline(studentId),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: getStudentProgressSnapshot(studentId),
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}

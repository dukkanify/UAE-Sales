import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import { canManageClass } from "@/services/classes/class-service";
import { classErrorResponse } from "@/app/api/classes/_utils";
import {
  createPerformanceReport,
  listPerformanceReports,
  PerformanceReportError,
} from "@/services/performance/report-service";
import type { PerformanceRating } from "@/types/performance-reports";

type Params = { params: Promise<{ id: string }> };

function errorResponse(error: unknown) {
  if (error instanceof PerformanceReportError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return classErrorResponse(error);
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (user.role === ROLES.STUDENT) {
      return NextResponse.json({
        success: true,
        data: listPerformanceReports({ liveClassId: id, studentId: user.id }),
        error: null,
      });
    }

    if (user.role === ROLES.INSTRUCTOR || user.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else {
      assertPermission(user, PERMISSIONS.REPORTS_VIEW);
    }

    return NextResponse.json({
      success: true,
      data: listPerformanceReports({ liveClassId: id }),
      error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (user.role === ROLES.INSTRUCTOR || user.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    } else {
      throw new PermissionError("Only instructors can submit performance reports", 403);
    }

    const body = (await request.json().catch(() => null)) as {
      studentId?: string;
      todaysTopic?: string;
      nextTopic?: string;
      homework?: string;
      performance?: PerformanceRating;
      questionBank?: string;
      comments?: string;
      sendEmail?: boolean;
    } | null;

    if (!body?.studentId) {
      return NextResponse.json(
        { success: false, data: null, error: "studentId required" },
        { status: 400 },
      );
    }

    const report = await createPerformanceReport({
      liveClassId: id,
      studentId: body.studentId,
      todaysTopic: body.todaysTopic ?? "",
      nextTopic: body.nextTopic ?? "",
      homework: body.homework ?? "",
      performance: body.performance as PerformanceRating,
      questionBank: body.questionBank ?? "",
      comments: body.comments ?? "",
      actorId: user.id,
      sendEmail: body.sendEmail,
    });

    return NextResponse.json({ success: true, data: report, error: null });
  } catch (error) {
    return errorResponse(error);
  }
}

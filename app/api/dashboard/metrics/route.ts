import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import {
  getAdminOverview,
  getAttendanceSeries,
  getDashboardCalendarEvents,
  getEarningsSeries,
  getEnrollmentSeries,
  getGrowthSeries,
  getInstructorOverview,
  getPlatformOverview,
  getProgressBreakdown,
  getRecentActivityFeed,
  getRevenueSeries,
  getStudentOverview,
} from "@/services/dashboard/metrics";
import { ROLES } from "@/constants/roles";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") ?? user.role;

    const charts = {
      growth: getGrowthSeries(),
      revenue: getRevenueSeries(),
      enrollments: getEnrollmentSeries(),
      attendance: getAttendanceSeries(),
      earnings: getEarningsSeries(),
      progress: getProgressBreakdown(),
    };

    const shared = {
      calendar: getDashboardCalendarEvents(),
      activity: getRecentActivityFeed(),
      charts,
    };

    if (scope === "super_admin" || user.role === ROLES.SUPER_ADMIN) {
      return NextResponse.json({
        success: true,
        data: { overview: getPlatformOverview(), ...shared },
        error: null,
      });
    }

    if (scope === "admin" || user.role === ROLES.ADMIN) {
      return NextResponse.json({
        success: true,
        data: { overview: getAdminOverview(), ...shared },
        error: null,
      });
    }

    if (scope === "instructor" || user.role === ROLES.INSTRUCTOR) {
      return NextResponse.json({
        success: true,
        data: { overview: getInstructorOverview(), ...shared },
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: { overview: getStudentOverview(), ...shared },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getCourseStats } from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.COURSES_MANAGE);
    return NextResponse.json({
      success: true,
      data: getCourseStats(),
      error: null,
    });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

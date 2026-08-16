import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import { getClassStats } from "@/services/classes/class-service";
import { getAttendanceOverview } from "@/services/classes/attendance-service";
import { classErrorResponse } from "@/app/api/classes/_utils";

export async function GET() {
  try {
    const user = await requireAuth();
    let scope: { instructorId?: string; studentId?: string } | undefined;

    if (user.role === ROLES.INSTRUCTOR || user.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
      scope = { instructorId: user.id };
    } else if (user.role === ROLES.STUDENT) {
      assertPermission(user, PERMISSIONS.ZOOM_CLASSES);
      scope = { studentId: user.id };
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }

    const stats = getClassStats(scope);
    const attendance = getAttendanceOverview(scope);
    return NextResponse.json({
      success: true,
      data: { ...stats, attendance },
      error: null,
    });
  } catch (error) {
    return classErrorResponse(error);
  }
}

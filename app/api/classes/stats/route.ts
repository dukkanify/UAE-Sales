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
    let instructorId: string | undefined;
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
      instructorId = user.id;
    } else if (user.role === ROLES.STUDENT) {
      assertPermission(user, PERMISSIONS.ZOOM_CLASSES);
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }

    const stats = getClassStats(instructorId);
    const attendance = getAttendanceOverview(instructorId);
    return NextResponse.json({
      success: true,
      data: { ...stats, attendance },
      error: null,
    });
  } catch (error) {
    return classErrorResponse(error);
  }
}

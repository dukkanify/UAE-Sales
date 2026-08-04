import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import {
  canManageClass,
} from "@/services/classes/class-service";
import {
  listAttendance,
  upsertAttendance,
} from "@/services/classes/attendance-service";
import { classErrorResponse } from "@/app/api/classes/_utils";
import type { AttendanceStatus } from "@/types/classes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }
    return NextResponse.json({
      success: true,
      data: listAttendance(id),
      error: null,
    });
  } catch (error) {
    return classErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }

    const body = (await request.json().catch(() => null)) as {
      studentId?: string;
      status?: AttendanceStatus;
      joinTime?: string | null;
      leaveTime?: string | null;
      notes?: string | null;
    } | null;

    if (!body?.studentId || !body.status) {
      return NextResponse.json(
        { success: false, data: null, error: "studentId and status required" },
        { status: 400 },
      );
    }

    const row = await upsertAttendance({
      liveClassId: id,
      studentId: body.studentId,
      status: body.status,
      joinTime: body.joinTime,
      leaveTime: body.leaveTime,
      notes: body.notes,
      actorId: user.id,
    });
    return NextResponse.json({ success: true, data: row, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}

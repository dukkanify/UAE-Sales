import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import {
  canManageClass,
  cancelLiveClass,
  duplicateLiveClass,
  rescheduleLiveClass,
} from "@/services/classes/class-service";
import { classErrorResponse } from "@/app/api/classes/_utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      reason?: string;
      startsAt?: string;
      endsAt?: string;
      durationMinutes?: number;
    };
    const ctx = getRequestContext(request);

    if (body.action === "cancel") {
      return NextResponse.json({
        success: true,
        data: await cancelLiveClass({
          id,
          reason: body.reason,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }
    if (body.action === "reschedule") {
      if (!body.startsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "startsAt required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await rescheduleLiveClass({
          id,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          durationMinutes: body.durationMinutes,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }
    if (body.action === "duplicate") {
      return NextResponse.json({
        success: true,
        data: await duplicateLiveClass({ id, actorId: user.id, ...ctx }),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return classErrorResponse(error);
  }
}

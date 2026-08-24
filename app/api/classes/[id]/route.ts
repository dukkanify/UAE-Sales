import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import {
  canManageClass,
  getLiveClassDetail,
  softDeleteLiveClass,
  updateLiveClass,
} from "@/services/classes/class-service";
import { classErrorResponse } from "@/app/api/classes/_utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const detail = getLiveClassDetail(id);
    if (!detail) {
      return NextResponse.json(
        { success: false, data: null, error: "Class not found" },
        { status: 404 },
      );
    }

    if (user.role === ROLES.STUDENT) {
      assertPermission(user, PERMISSIONS.ZOOM_CLASSES);
      const allowed = detail.participants.some((p) => p.userId === user.id);
      if (!allowed) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
      // Hide host start URL fields already stripped in detail.zoom
    } else if (user.role === ROLES.INSTRUCTOR) {
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

    return NextResponse.json({ success: true, data: detail, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
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

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);
    const updated = await updateLiveClass({
      id,
      patch: body,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
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
    const ctx = getRequestContext(request);
    await softDeleteLiveClass({ id, actorId: user.id, ...ctx });
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}

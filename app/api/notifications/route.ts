import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import {
  getUnreadCount,
  listNotifications,
  markNotificationRead,
} from "@/services/notifications/notification-service";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/services/auth/permissions";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = listNotifications(user.id, { page, unreadOnly });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    const body = (await request.json().catch(() => null)) as { id?: string } | null;
    if (!body?.id) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification id required" },
        { status: 400 },
      );
    }
    const updated = markNotificationRead(user.id, body.id);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: { notification: updated, unreadCount: getUnreadCount(user.id) },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

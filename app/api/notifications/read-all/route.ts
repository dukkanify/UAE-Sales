import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import { markAllNotificationsRead } from "@/services/notifications/notification-service";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/services/auth/permissions";

export async function POST() {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    const count = markAllNotificationsRead(user.id);
    return NextResponse.json({
      success: true,
      data: { marked: count },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

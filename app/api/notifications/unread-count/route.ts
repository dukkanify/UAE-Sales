import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import { getUnreadCount } from "@/services/notifications/notification-service";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/services/auth/permissions";

/** Lightweight poll endpoint for near-realtime unread badge updates. */
export async function GET() {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    return NextResponse.json({
      success: true,
      data: {
        unreadCount: getUnreadCount(user.id),
        serverTime: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

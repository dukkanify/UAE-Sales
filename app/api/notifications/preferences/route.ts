import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/notifications/notification-service";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/services/auth/permissions";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function GET() {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    return NextResponse.json({
      success: true,
      data: getNotificationPreferences(user.id),
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid body" },
        { status: 400 },
      );
    }
    const boolKeys = [
      "emailTransactional",
      "emailMarketing",
      "emailProductUpdates",
      "inAppEnabled",
      "emailEnabled",
      "pushEnabled",
      "marketingEnabled",
      "reminderEnabled",
      "securityEnabled",
      "courseEnabled",
      "bookingEnabled",
      "paymentEnabled",
      "messageEnabled",
    ] as const;
    const patch: Record<string, boolean> = {};
    for (const key of boolKeys) {
      if (typeof body[key] === "boolean") patch[key] = body[key] as boolean;
    }
    const updated = updateNotificationPreferences(user.id, patch);
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

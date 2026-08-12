import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllNotifications } from "@/services/payments/notification-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const notifications = await getAllNotifications();
  return NextResponse.json({
    summary: {
      total: notifications.length,
      unread: notifications.filter((item) => !item.read).length,
    },
    notifications: notifications.slice(0, 100),
  });
}

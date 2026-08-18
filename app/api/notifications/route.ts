import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { getNotificationsForUser } from "@/services/payments/notification-store";

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ unread: 0, notifications: [] });
  }

  const notifications = await getNotificationsForUser(user.id);
  return NextResponse.json({
    unread: notifications.filter((item) => !item.read).length,
    notifications: notifications.slice(0, 20),
  });
}

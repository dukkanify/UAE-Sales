import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { getNotificationsForUser } from "@/services/payments/notification-store";

export async function GET() {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) {
    return user;
  }

  const notifications = await getNotificationsForUser(user.id);
  return NextResponse.json({
    unread: notifications.filter((item) => !item.read).length,
    notifications: notifications.slice(0, 20),
  });
}

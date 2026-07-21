import { NextResponse } from "next/server";
import { getAllNotifications } from "@/services/payments/notification-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
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

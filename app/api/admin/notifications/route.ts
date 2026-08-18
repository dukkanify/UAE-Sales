import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getEmailLogs } from "@/services/email/email-log-store";
import { getAllNotifications } from "@/services/payments/notification-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const notifications = await getAllNotifications();
  const emailLogs = await getEmailLogs();
  return NextResponse.json({
    summary: {
      total: notifications.length,
      unread: notifications.filter((item) => !item.read).length,
      emailsSent: emailLogs.filter((item) => item.status === "sent").length,
      emailsFailed: emailLogs.filter((item) => item.status === "failed").length,
    },
    notifications: notifications.slice(0, 100),
    emailLogs: emailLogs.slice(0, 80),
  });
}

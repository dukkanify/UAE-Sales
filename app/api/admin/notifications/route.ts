import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getEmailLogs } from "@/services/email/email-log-store";
import {
  retryEmailLog,
  retryFailedEmails,
  sendTransactionalEmail,
} from "@/services/email/transactional-email";
import { EMAIL_SITE_URL } from "@/services/email/sooqna-email-template";
import { getAllNotifications } from "@/services/payments/notification-store";
import { checkRateLimit } from "@/services/auth/rate-limit";

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
      emailsPending: emailLogs.filter((item) => item.status === "pending").length,
    },
    notifications: notifications.slice(0, 100),
    emailLogs: emailLogs
      .slice(0, 80)
      .map(({ html: _html, text: _text, ...rest }) => rest),
  });
}

const postSchema = z.object({
  action: z.enum(["retry", "retry_all", "test"]),
  id: z.string().min(1).max(80).optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  if (parsed.data.action === "retry") {
    if (!parsed.data.id) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const status = await retryEmailLog(parsed.data.id);
    return NextResponse.json({ ok: true, status });
  }

  if (parsed.data.action === "retry_all") {
    const result = await retryFailedEmails();
    return NextResponse.json({ ok: true, ...result });
  }

  const allowed = await checkRateLimit(`admin-test-email:${admin.id}`);
  if (!allowed) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const to = admin.email?.trim().toLowerCase();
  if (!to) {
    return NextResponse.json({ error: "NO_EMAIL" }, { status: 400 });
  }

  const status = await sendTransactionalEmail({
    type: "system_test",
    to,
    userId: admin.id,
    entityId: `test-${Date.now()}`,
    dedupeWindowMs: 60 * 1000,
    subject: "بريد تجريبي من سوقنا",
    title: "تم إرسال بريد تجريبي",
    bodyHtml:
      '<p style="font-size:16px;line-height:1.8;margin:0;">هذه رسالة تجريبية من نظام إشعارات البريد في سوقنا. إذا وصلتك، فإن قناة Resend تعمل.</p>',
    bodyLines: ["هذه رسالة تجريبية من سوقنا. قناة البريد تعمل."],
    ctaHref: EMAIL_SITE_URL,
    ctaLabel: "فتح سوقنا",
  });

  return NextResponse.json({ ok: true, status, to });
}

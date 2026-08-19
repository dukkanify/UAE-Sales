import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import {
  getNotificationsForUser,
  markNotificationsRead,
} from "@/services/payments/notification-store";

export async function GET(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) {
    return user;
  }

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 200)
    : 20;

  const notifications = await getNotificationsForUser(user.id);
  return NextResponse.json({
    unread: notifications.filter((item) => !item.read).length,
    notifications: notifications.slice(0, limit),
    total: notifications.length,
  });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) {
    return user;
  }

  const body = (await request.json().catch(() => null)) as
    | { ids?: unknown }
    | null;
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id): id is string => typeof id === "string" && id.length > 0)
    : undefined;

  const unread = await markNotificationsRead(user.id, ids);
  return NextResponse.json({ ok: true, unread });
}

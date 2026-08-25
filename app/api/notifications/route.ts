import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/services/auth/guards";
import {
  archiveNotification,
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markNotificationRead,
} from "@/services/notifications/notification-service";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission } from "@/services/auth/permissions";
import { parsePagination } from "@/lib/api/envelope";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const started = Date.now();
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);

    const url = new URL(request.url);
    const p = parsePagination(url);
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const grouped = url.searchParams.get("grouped") !== "false";
    const status = (url.searchParams.get("status") ?? "active") as
      "unread" | "read" | "archived" | "all" | "active";
    const type = url.searchParams.get("type") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const priority = url.searchParams.get("priority") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const result = listNotifications(user.id, {
      page: p.page,
      pageSize: p.pageSize,
      unreadOnly,
      status,
      type,
      category,
      priority,
      q,
      from,
      to,
      grouped,
    });

    return NextResponse.json({
      success: true,
      data: { ...result, tookMs: Date.now() - started },
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
    const body = (await request.json().catch(() => null)) as {
      id?: string;
      action?: "read" | "archive" | "delete";
    } | null;
    if (!body?.id) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification id required" },
        { status: 400 },
      );
    }
    const action = body.action ?? "read";
    const updated =
      action === "archive"
        ? archiveNotification(user.id, body.id)
        : action === "delete"
          ? deleteNotification(user.id, body.id)
          : markNotificationRead(user.id, body.id);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: { notification: updated, unreadCount: getUnreadCount(user.id) },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.NOTIFICATIONS_OWN);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification id required" },
        { status: 400 },
      );
    }
    const updated = deleteNotification(user.id, id);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, error: "Notification not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: { notification: updated, unreadCount: getUnreadCount(user.id) },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

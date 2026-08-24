import { generateId } from "@/lib/security/crypto";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import { readAuthDb, writeAuthDb } from "@/services/auth/store";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  channel?: "in_app" | "email";
  type?: string;
  data?: Record<string, unknown>;
}): Promise<NotificationRecord> {
  const record: NotificationRecord = {
    id: generateId(),
    userId: input.userId,
    title: input.title,
    body: input.body,
    channel: input.channel ?? "in_app",
    type: input.type ?? "system",
    data: input.data ?? {},
    readAt: null,
    createdAt: new Date().toISOString(),
  };

  writeAuthDb((db) => {
    db.notifications.unshift(record);
  });

  return record;
}

export function listNotifications(
  userId: string,
  options?: { page?: number; pageSize?: number; unreadOnly?: boolean },
): PaginatedResponse<NotificationRecord> & { unreadCount: number } {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const db = readAuthDb();
  let rows = db.notifications.filter((n) => n.userId === userId);
  const unreadCount = rows.filter((n) => !n.readAt).length;

  if (options?.unreadOnly) {
    rows = rows.filter((n) => !n.readAt);
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    unreadCount,
  };
}

export function markNotificationRead(
  userId: string,
  notificationId: string,
): NotificationRecord | null {
  let updated: NotificationRecord | null = null;
  writeAuthDb((db) => {
    const n = db.notifications.find(
      (x) => x.id === notificationId && x.userId === userId,
    );
    if (n && !n.readAt) {
      n.readAt = new Date().toISOString();
      updated = n;
    } else if (n) {
      updated = n;
    }
  });
  return updated;
}

export function markAllNotificationsRead(userId: string): number {
  let count = 0;
  writeAuthDb((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId && !n.readAt) {
        n.readAt = new Date().toISOString();
        count += 1;
      }
    });
  });
  return count;
}

export function getUnreadCount(userId: string): number {
  return readAuthDb().notifications.filter((n) => n.userId === userId && !n.readAt).length;
}

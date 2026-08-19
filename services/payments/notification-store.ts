import { tx } from "@/shared/i18n/tx";
import { dispatchWebPush } from "@/services/notifications/web-push-client";
import type { AppNotification } from "@/types/domain/notification";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const NOTIFICATIONS_FILE = "notifications.json";

export async function createNotification(
  input: Omit<AppNotification, "id" | "read" | "createdAt">,
): Promise<AppNotification> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  const notification: AppNotification = {
    ...input,
    titleEn: input.titleEn ?? tx("en", input.title),
    bodyEn: input.bodyEn ?? tx("en", input.body),
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  await saveCollection(NOTIFICATIONS_FILE, notifications);

  void dispatchWebPush(notification).catch((error) => {
    console.error("[Sooqna Notify] push dispatch failed", error);
  });

  return notification;
}

export async function getNotificationsForUser(
  userId: string,
): Promise<AppNotification[]> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  return notifications.filter((item) => item.userId === userId);
}

export async function markNotificationsRead(
  userId: string,
  ids?: string[],
): Promise<number> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  const idSet = ids && ids.length > 0 ? new Set(ids) : null;
  let changed = false;

  for (const item of notifications) {
    if (item.userId !== userId || item.read) continue;
    if (idSet && !idSet.has(item.id)) continue;
    item.read = true;
    changed = true;
  }

  if (changed) {
    await saveCollection(NOTIFICATIONS_FILE, notifications);
  }

  return notifications.filter((item) => item.userId === userId && !item.read).length;
}

export async function getAllNotifications(): Promise<AppNotification[]> {
  return loadCollection<AppNotification>(NOTIFICATIONS_FILE);
}

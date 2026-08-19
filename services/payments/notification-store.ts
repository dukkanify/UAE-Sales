import { dispatchWebPush } from "@/services/notifications/web-push-client";
import type { AppNotification } from "@/types/domain/notification";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const NOTIFICATIONS_FILE = "notifications.json";

export async function findNotificationByIdempotencyKey(
  key: string,
): Promise<AppNotification | undefined> {
  if (!key) return undefined;
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  return notifications.find((item) => item.idempotencyKey === key);
}

export async function createNotification(
  input: Omit<AppNotification, "id" | "read" | "createdAt">,
): Promise<AppNotification> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);

  if (input.idempotencyKey) {
    const existing = notifications.find(
      (item) => item.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return existing;
  }

  const notification: AppNotification = {
    ...input,
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

export async function patchNotification(
  id: string,
  patch: Partial<Pick<AppNotification, "emailStatus" | "read">>,
): Promise<void> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  const index = notifications.findIndex((item) => item.id === id);
  if (index < 0) return;
  notifications[index] = { ...notifications[index], ...patch };
  await saveCollection(NOTIFICATIONS_FILE, notifications);
}

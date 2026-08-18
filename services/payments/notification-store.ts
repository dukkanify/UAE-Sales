import type { AppNotification } from "@/types/domain/notification";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const NOTIFICATIONS_FILE = "notifications.json";

export async function createNotification(
  input: Omit<AppNotification, "id" | "read" | "createdAt">,
): Promise<AppNotification> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  const notification: AppNotification = {
    ...input,
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    href: input.href ?? (input.orderId ? `/orders/${input.orderId}` : undefined),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  await saveCollection(NOTIFICATIONS_FILE, notifications);
  return notification;
}

export async function getNotificationsForUser(
  userId: string,
): Promise<AppNotification[]> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  return notifications.filter((item) => item.userId === userId);
}

export async function getAllNotifications(): Promise<AppNotification[]> {
  return loadCollection<AppNotification>(NOTIFICATIONS_FILE);
}

export async function markNotificationsReadForUser(
  userId: string,
): Promise<number> {
  const notifications = await loadCollection<AppNotification>(NOTIFICATIONS_FILE);
  let changed = 0;
  const next = notifications.map((item) => {
    if (item.userId !== userId || item.read) return item;
    changed += 1;
    return { ...item, read: true };
  });
  if (changed > 0) {
    await saveCollection(NOTIFICATIONS_FILE, next);
  }
  return changed;
}

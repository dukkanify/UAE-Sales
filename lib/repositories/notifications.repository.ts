import type { NotificationRecord } from "@/types/domain/notification";
import type { NotificationType as DbNotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const notificationTypeMap = {
  NEW_MESSAGE: "new_message",
  LISTING_APPROVED: "listing_approved",
  LISTING_REJECTED: "listing_rejected",
  ORDER_CREATED: "order_created",
  PAYMENT_HELD: "payment_held",
  PAYMENT_RELEASED: "payment_released",
  DISPUTE_OPENED: "dispute_opened",
  WALLET_UPDATED: "wallet_updated",
} as const;

function mapDbNotification(notification: {
  id: string;
  type: DbNotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  metadata: unknown;
}): NotificationRecord {
  const metadata =
    notification.metadata && typeof notification.metadata === "object"
      ? (notification.metadata as Record<string, string>)
      : undefined;

  return {
    id: notification.id,
    type: notificationTypeMap[notification.type],
    title: notification.title,
    body: notification.body,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    href: metadata?.href,
    metadata,
  };
}

export async function getNotificationsFromDb(
  userId: string,
): Promise<NotificationRecord[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return notifications.map(mapDbNotification);
}

export async function getUnreadNotificationsCountFromDb(
  userId: string,
): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationReadInDb(
  userId: string,
  notificationId: string,
): Promise<NotificationRecord | undefined> {
  const notification = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });

  if (notification.count === 0) {
    return undefined;
  }

  const updated = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  return updated ? mapDbNotification(updated) : undefined;
}

export async function markAllNotificationsReadInDb(
  userId: string,
): Promise<NotificationRecord[]> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return getNotificationsFromDb(userId);
}

export async function seedNotificationsForUser(userId: string) {
  const existing = await prisma.notification.count({ where: { userId } });
  if (existing > 0) {
    return;
  }

  const { getMockNotifications } = await import("@/mock/notifications.mock");
  const items = getMockNotifications();

  await prisma.notification.createMany({
    data: items.map((item) => ({
      userId,
      type: item.type.toUpperCase().replace("-", "_") as DbNotificationType,
      title: item.title,
      body: item.body,
      read: item.read,
      metadata: item.href ? { href: item.href } : undefined,
      createdAt: new Date(item.createdAt),
    })),
  });
}

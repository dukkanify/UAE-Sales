import type { NotificationRecord } from "@/types/domain/notification";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getNotificationsFromDb,
  getUnreadNotificationsCountFromDb,
  seedNotificationsForUser,
} from "@/lib/repositories/notifications.repository";
import {
  getMockNotifications,
  getMockUnreadNotificationsCount,
} from "@/mock/notifications.mock";

async function getSessionUserId(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }
  const { getCurrentSessionUser } = await import("@/lib/auth/session");
  const user = await getCurrentSessionUser();
  return user?.id ?? null;
}

export async function getNotifications(): Promise<NotificationRecord[]> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return getMockNotifications();
      }
      await seedNotificationsForUser(userId);
      return getNotificationsFromDb(userId);
    },
    getMockNotifications,
    "notifications",
  );
}

export async function getRecentNotifications(
  limit = 4,
): Promise<NotificationRecord[]> {
  const items = await getNotifications();
  return items.slice(0, limit);
}

export async function getUnreadNotificationsCount(): Promise<number> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return getMockUnreadNotificationsCount();
      }
      await seedNotificationsForUser(userId);
      return getUnreadNotificationsCountFromDb(userId);
    },
    getMockUnreadNotificationsCount,
    "notifications-unread-count",
  );
}

export type { NotificationRecord };

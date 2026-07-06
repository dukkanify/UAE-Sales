import type { NotificationRecord } from "@/types/domain/notification";
import { apiClient, isApiConfigured } from "@/services/api";
import {
  getMockNotifications,
  getMockUnreadNotificationsCount,
  markAllMockNotificationsRead,
  markMockNotificationRead,
} from "@/mock/notifications.mock";

async function fetchWithFallback<T>(
  path: string,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (isApiConfigured()) {
    try {
      return await apiClient<T>(path);
    } catch {
      // fall through
    }
  }
  return fallback();
}

export async function fetchNotifications(): Promise<NotificationRecord[]> {
  return fetchWithFallback("/api/notifications", getMockNotifications);
}

export async function fetchUnreadNotificationsCount(): Promise<number> {
  if (isApiConfigured()) {
    try {
      const result = await apiClient<{ count: number }>(
        "/api/notifications/unread-count",
      );
      return result.count;
    } catch {
      // fall through
    }
  }
  return getMockUnreadNotificationsCount();
}

export async function markNotificationReadClient(
  id: string,
): Promise<NotificationRecord | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<NotificationRecord>(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
    } catch {
      // fall through
    }
  }

  return markMockNotificationRead(id);
}

export async function markAllNotificationsReadClient(): Promise<NotificationRecord[]> {
  if (isApiConfigured()) {
    try {
      return await apiClient<NotificationRecord[]>("/api/notifications/read-all", {
        method: "PATCH",
      });
    } catch {
      // fall through
    }
  }

  return markAllMockNotificationsRead();
}

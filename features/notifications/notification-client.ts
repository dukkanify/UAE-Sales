import { STORAGE_EVENTS } from "@/shared/constants/brand";
import type { AppNotification } from "@/types/domain/notification";

export type NotificationsPayload = {
  notifications: AppNotification[];
  unread: number;
};

export function emitNotificationsChanged() {
  window.dispatchEvent(new Event(STORAGE_EVENTS.notificationsChange));
}

export async function fetchNotifications(): Promise<NotificationsPayload> {
  const response = await fetch("/api/notifications", { credentials: "include" });
  if (!response.ok) {
    return { notifications: [], unread: 0 };
  }
  const data = (await response.json()) as Partial<NotificationsPayload>;
  return {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    unread: typeof data.unread === "number" ? data.unread : 0,
  };
}

export async function markNotificationsRead(ids?: string[]): Promise<number> {
  const response = await fetch("/api/notifications", {
    body: JSON.stringify(ids && ids.length > 0 ? { ids } : {}),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) return 0;
  const data = (await response.json()) as { unread?: number };
  emitNotificationsChanged();
  return typeof data.unread === "number" ? data.unread : 0;
}

export function formatNotificationTime(iso: string, locale: "ar" | "en" = "ar"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (locale === "en") {
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString("en-AE", { day: "numeric", month: "short" });
  }
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return date.toLocaleDateString("ar-AE", { day: "numeric", month: "short" });
}

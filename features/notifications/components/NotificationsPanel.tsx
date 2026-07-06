"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationRecord } from "@/types/domain/notification";
import { NotificationCard } from "@/features/notifications/components/NotificationCard";
import {
  fetchNotifications,
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from "@/services/notifications/notifications.client";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadNotifications();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  async function handleMarkRead(id: string) {
    const updated = await markNotificationReadClient(id);
    if (updated) {
      setNotifications((items) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
    }
  }

  async function handleMarkAllRead() {
    const updated = await markAllNotificationsReadClient();
    setNotifications(updated);
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (loading) {
    return (
      <Card className="marketplace-panel p-6" variant="flat">
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="5rem" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="marketplace-panel p-6" variant="flat">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">كل الإشعارات</p>
          <p className="mt-1 text-xs text-muted">
            {notifications.length} إشعار
            {unreadCount > 0 ? ` · ${unreadCount} غير مقروء` : ""}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button onClick={handleMarkAllRead} size="sm" variant="secondary">
            تعليم الكل كمقروء
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            actionHref="/search"
            actionLabel="تصفح الإعلانات"
            description="ستظهر هنا إشعارات الرسائل والطلبات والضمان والمحفظة."
            icon="bell"
            title="لا توجد إشعارات"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

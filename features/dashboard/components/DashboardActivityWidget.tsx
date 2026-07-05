"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NotificationRecord } from "@/types/domain/notification";
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
} from "@/services/notifications/notifications.client";
import { fetchUnreadMessagesCount } from "@/services/chat/chat.client";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";

export function DashboardActivityWidget() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationsCount(),
        fetchUnreadMessagesCount(),
      ])
        .then(([items, notifCount, messageCount]) => {
          setNotifications(items.slice(0, 4));
          setUnreadNotifications(notifCount);
          setUnreadMessages(messageCount);
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <Card className="marketplace-panel p-5" variant="flat">
        <Skeleton height="1rem" width="30%" />
        <div className="mt-4 grid gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height="3rem" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="marketplace-panel p-5" variant="flat">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">النشاط الأخير</h2>
          <p className="mt-1 text-xs text-muted">
            {unreadMessages} رسائل غير مقروءة · {unreadNotifications} إشعارات جديدة
          </p>
        </div>
        <Link className="text-xs font-semibold text-primary" href="/notifications">
          عرض الكل
        </Link>
      </div>

      <ul className="mt-4 grid gap-2">
        {notifications.map((item) => (
          <li
            key={item.id}
            className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm ${
              item.read
                ? "bg-surface-muted text-muted"
                : "border border-primary/15 bg-primary-soft"
            }`}
          >
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-0.5 text-xs">{item.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
        <Link className="text-primary" href="/chat">
          الرسائل ({unreadMessages})
        </Link>
        <Link className="text-primary" href="/notifications">
          الإشعارات ({unreadNotifications})
        </Link>
      </div>
    </Card>
  );
}

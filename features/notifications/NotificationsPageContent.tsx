"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "@/types/domain/notification";
import {
  formatNotificationTime,
  markNotificationsRead,
} from "@/features/notifications/notification-client";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

export function NotificationsPageContent() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=100", { credentials: "include" });
      if (!response.ok) {
        setItems([]);
        setUnread(0);
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
      setUnread(typeof data.unread === "number" ? data.unread : 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  async function markAllRead() {
    const nextUnread = await markNotificationsRead();
    setUnread(nextUnread);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  return (
    <Card className="p-5" variant="flat">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-black text-ink">الإشعارات</h1>
          <p className="mt-1 text-sm text-muted">
            نفس مصدر الجرس في الأعلى — محدّث من الخادم.
          </p>
        </div>
        {unread > 0 ? (
          <Button onClick={() => void markAllRead()} size="sm" type="button" variant="secondary">
            تعليم الكل كمقروء
          </Button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            actionHref="/search"
            actionLabel="استكشف السوق"
            description="ستظهر هنا تنبيهات الطلبات والحجوزات والضمان."
            icon="message"
            title="لا إشعارات"
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {items.map((item) => {
            const content = (
              <>
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted">{item.body}</p>
                <p className="mt-1 text-[11px] text-muted">{formatNotificationTime(item.createdAt)}</p>
              </>
            );
            return (
              <li
                key={item.id}
                className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm ${
                  item.read ? "bg-surface-muted text-muted" : "border border-primary/15 bg-primary-soft"
                }`}
              >
                {item.href ? (
                  <Link className="block" href={item.href}>
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

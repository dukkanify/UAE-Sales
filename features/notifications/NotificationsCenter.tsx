"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useLocale } from "@/shared/i18n/useLocale";
import { notificationIcon } from "@/services/notifications/notification-icons";
import type { AppNotification } from "@/types/domain/notification";
import {
  fetchNotifications,
  formatNotificationTime,
  markNotificationsRead,
  notificationCopy,
} from "@/features/notifications/notification-client";
import { NotificationPreferencesPanel } from "@/features/notifications/NotificationPreferencesPanel";

export function NotificationsCenter() {
  const locale = useLocale();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchNotifications(100);
    setItems(data.notifications);
    setUnread(data.unread);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function markOne(id: string) {
    const nextUnread = await markNotificationsRead([id]);
    setUnread(nextUnread);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  async function markAll() {
    const nextUnread = await markNotificationsRead();
    setUnread(nextUnread);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  const title = locale === "en" ? "Notifications" : "الإشعارات";
  const markAllLabel = locale === "en" ? "Mark all as read" : "تعليم الكل كمقروء";
  const unreadLabel =
    locale === "en" ? `${unread} unread` : `${unread} غير مقروء`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{unreadLabel}</p>
        </div>
        {unread > 0 ? (
          <Button onClick={() => void markAll()} size="sm" type="button" variant="ghost">
            {markAllLabel}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">
            {locale === "en" ? "Loading…" : "جاري التحميل..."}
          </p>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          actionHref="/search"
          actionLabel={locale === "en" ? "Browse Sooqna" : "تصفّح سوقنا"}
          description={
            locale === "en"
              ? "Order, booking, and listing updates will appear here."
              : "تظهر هنا تحديثات الطلبات والحجوزات والإعلانات."
          }
          icon="bell"
          title={locale === "en" ? "No notifications yet" : "لا إشعارات حتى الآن"}
        />
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => {
            const copy = notificationCopy(item, locale);
            const content = (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-ink">
                  <Icon name={notificationIcon(item.type)} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{copy.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-muted">{copy.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatNotificationTime(item.createdAt, locale)}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    className={`block rounded-[var(--radius-xl)] border border-border p-4 transition hover:bg-surface-muted ${
                      item.read ? "" : "bg-surface-muted/60"
                    }`}
                    href={item.href}
                    onClick={() => {
                      if (!item.read) void markOne(item.id);
                    }}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    className={`w-full rounded-[var(--radius-xl)] border border-border p-4 text-start ${
                      item.read ? "" : "bg-surface-muted/60"
                    }`}
                    onClick={() => {
                      if (!item.read) void markOne(item.id);
                    }}
                    type="button"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <NotificationPreferencesPanel />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { Icon } from "@/shared/ui/Icon";
import {
  fetchNotifications,
  formatNotificationTime,
  markNotificationsRead,
} from "@/features/notifications/notification-client";
import { enableBrowserNotifications } from "@/features/notifications/NotificationPushRegistrar";
import type { AppNotification } from "@/types/domain/notification";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { tx } from "@/shared/i18n/tx";
import { useLocale } from "@/shared/i18n/useLocale";
import "./notification-bell.css";

type NotificationBellProps = {
  badgeClassName?: string;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
};

const POLL_MS = 20_000;

function readPushUi() {
  const permission =
    typeof Notification === "undefined" ? "denied" : Notification.permission;
  const ios =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;
  return {
    iosHint: ios && !standalone,
    prompt: permission === "default",
    ready: permission === "granted",
  };
}

export function NotificationBell({
  badgeClassName = "mobile-home-header__badge",
  className = "mobile-home-header__notify",
  iconClassName = "mobile-home-header__notify-icon",
  iconSize = 17,
}: NotificationBellProps) {
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  const locale = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [pushUi, setPushUi] = useState({ iosHint: false, prompt: false, ready: false });
  const lastUnread = useRef(0);

  const refresh = useCallback(async (opts?: { announce?: boolean }) => {
    const data = await fetchNotifications();
    setItems(data.notifications);
    setUnread(data.unread);

    if (
      opts?.announce &&
      data.unread > lastUnread.current &&
      document.hidden &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const newest = data.notifications.find((item) => !item.read);
      if (newest) {
        new Notification(newest.title, {
          body: newest.body,
          icon: "/brand/app-icon.svg",
          tag: newest.id,
        });
      }
    }

    lastUnread.current = data.unread;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const initial = window.setTimeout(() => {
      void refresh();
    }, 0);
    const onChange = () => {
      void refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(() => {
      void refresh({ announce: true });
    }, POLL_MS);

    window.addEventListener(STORAGE_EVENTS.notificationsChange, onChange);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.removeEventListener(STORAGE_EVENTS.notificationsChange, onChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refresh, user]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visibleUnread = user ? unread : 0;

  async function openPanel() {
    setOpen(true);
    setPushUi(readPushUi());
    const data = await fetchNotifications();
    setItems(data.notifications);
    setFreshIds(new Set(data.notifications.filter((item) => !item.read).map((item) => item.id)));
    if (data.unread > 0) {
      const nextUnread = await markNotificationsRead();
      setUnread(nextUnread);
      lastUnread.current = nextUnread;
    }
  }

  if (!user) {
    return (
      <LocalizedTree>
      <div className="notify-bell">
        <Link
          aria-label="الإشعارات"
          className={`${className} notify-bell__trigger`}
          href="/login?next=/notifications"
        >
          <span className="mobile-home-header__notify-ring" aria-hidden />
          <Icon className={iconClassName} name="bell" size={iconSize} />
        </Link>
      </div>
      </LocalizedTree>
    );
  }

  return (
    <LocalizedTree>
    <div className="notify-bell" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={
          visibleUnread > 0 ? `الإشعارات، ${visibleUnread} غير مقروء` : "الإشعارات"
        }
        className={`${className} notify-bell__trigger`}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          void openPanel();
        }}
        type="button"
      >
        <span className="mobile-home-header__notify-ring" aria-hidden />
        <Icon className={iconClassName} name="bell" size={iconSize} />
        {visibleUnread > 0 ? (
          <span className={badgeClassName}>{visibleUnread > 9 ? "9+" : visibleUnread}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notify-bell__panel" id={panelId} role="dialog" aria-label="الإشعارات">
          <div className="notify-bell__head">
            <p className="notify-bell__title">الإشعارات</p>
            {freshIds.size > 0 ? (
              <button
                className="notify-bell__action notify-bell__action--ghost"
                onClick={() => setFreshIds(new Set())}
                type="button"
              >
                إخفاء التحديد
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="notify-bell__empty">لا إشعارات حتى الآن.</p>
          ) : (
            <ul className="notify-bell__list">
              {items.map((item) => {
                const isFresh = freshIds.has(item.id);
                const content = (
                  <>
                    <p className="notify-bell__item-title">
                      {locale === "en" ? item.titleEn || tx(locale, item.title) : item.title}
                    </p>
                    <p className="notify-bell__item-body">
                      {locale === "en" ? item.bodyEn || tx(locale, item.body) : item.body}
                    </p>
                    <p className="notify-bell__item-time">
                      {formatNotificationTime(item.createdAt, locale)}
                    </p>
                  </>
                );
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        className={`notify-bell__item${isFresh ? " notify-bell__item--unread" : ""}`}
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          setFreshIds((current) => {
                            const next = new Set(current);
                            next.delete(item.id);
                            return next;
                          });
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={`notify-bell__item${isFresh ? " notify-bell__item--unread" : ""}`}>
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="notify-bell__actions">
            {pushUi.prompt ? (
              <button
                className="notify-bell__action"
                onClick={() => {
                  void enableBrowserNotifications().then(() => setPushUi(readPushUi()));
                }}
                type="button"
              >
                تفعيل تنبيهات المتصفح
              </button>
            ) : null}
            {pushUi.ready ? (
              <p className="notify-bell__hint">التنبيهات الفورية مفعّلة على هذا الجهاز.</p>
            ) : null}
            {pushUi.iosHint ? (
              <p className="notify-bell__hint">
                على الآيفون: أضف سوقنا إلى الشاشة الرئيسية حتى تصلك التنبيهات والتطبيق مغلق.
              </p>
            ) : null}
            <Link
              className="notify-bell__action"
              href="/notifications"
              onClick={() => setOpen(false)}
            >
              عرض الكل
            </Link>
          </div>
        </div>
      ) : null}
    </div>
    </LocalizedTree>
  );
}

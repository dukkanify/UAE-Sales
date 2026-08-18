"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { Icon } from "@/shared/ui/Icon";

type NotificationBellProps = {
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
};

export function NotificationBell({
  className = "mobile-home-header__notify",
  iconClassName = "mobile-home-header__notify-icon",
  badgeClassName = "mobile-home-header__badge",
}: NotificationBellProps) {
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  const [unread, setUnread] = useState(0);
  const visibleUnread = user ? unread : 0;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    void fetch("/api/notifications", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) {
          setUnread(typeof data?.unread === "number" ? data.unread : 0);
        }
      })
      .catch(() => {
        if (!cancelled) setUnread(0);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <Link
      aria-label={visibleUnread > 0 ? `الإشعارات، ${visibleUnread} غير مقروء` : "الإشعارات"}
      className={className}
      href={user ? "/profile#notifications" : "/login?next=/profile#notifications"}
    >
      <span className="mobile-home-header__notify-ring" aria-hidden />
      <Icon className={iconClassName} name="bell" size={17} />
      {visibleUnread > 0 ? (
        <span className={badgeClassName}>{visibleUnread > 9 ? "9+" : visibleUnread}</span>
      ) : null}
    </Link>
  );
}

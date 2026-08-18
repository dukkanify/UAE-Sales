"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { useT } from "@/shared/i18n/useLocale";
import { Icon } from "@/shared/ui/Icon";

type NotificationBellProps = {
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  showRing?: boolean;
};

function formatUnread(count: number) {
  return count > 9 ? "9+" : String(count);
}

export function NotificationBell({
  className = "",
  iconClassName,
  iconSize = 17,
  showRing = false,
}: NotificationBellProps) {
  const t = useT();
  const [unread, setUnread] = useState(0);

  const load = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data: { unread?: number }) => {
        setUnread(typeof data.unread === "number" ? data.unread : 0);
      })
      .catch(() => setUnread(0));
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener(STORAGE_EVENTS.sessionChange, onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(STORAGE_EVENTS.sessionChange, onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  const label =
    unread > 0 ? t("notify.unread", { count: unread }) : t("notify.label");

  return (
    <Link
      aria-label={label}
      className={`notification-bell ${className}`.trim()}
      href="/profile#notifications"
    >
      {showRing ? <span aria-hidden className="mobile-home-header__notify-ring" /> : null}
      <Icon className={iconClassName} name="bell" size={iconSize} />
      {unread > 0 ? (
        <span className="notification-bell__badge">{formatUnread(unread)}</span>
      ) : null}
    </Link>
  );
}

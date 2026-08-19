"use client";

import { useEffect, useState } from "react";
import { getSessionUser, setSessionUser } from "@/services/storage";
import { persistSessionCookie } from "@/services/auth/session-sync";
import { Card } from "@/shared/ui/Card";
import { useLocale } from "@/shared/i18n/useLocale";
import {
  PREFERENCE_LABELS,
  resolveNotificationPreferences,
} from "@/services/notifications/notification-preferences";
import type { NotificationPreferences } from "@/types/domain/notification";

const CRITICAL_HINT = {
  ar: "رسائل الأمان والطلبات والحجوزات لا يمكن إيقافها.",
  en: "Security, order, and booking emails cannot be turned off.",
};

export function NotificationPreferencesPanel() {
  const locale = useLocale();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    resolveNotificationPreferences(null),
  );

  useEffect(() => {
    void fetch("/api/notifications/preferences", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) setPrefs(resolveNotificationPreferences({ notificationPreferences: data.preferences }));
      })
      .catch(() => undefined);
  }, []);

  async function toggle(key: keyof NotificationPreferences, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const response = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...next, locale }),
    });
    if (!response.ok) return;
    const data = await response.json();
    const session = getSessionUser();
    if (session && data.preferences) {
      const updated = {
        ...session,
        notificationPreferences: data.preferences,
        locale: data.locale ?? locale,
      };
      setSessionUser(updated);
      void persistSessionCookie(updated);
    }
  }

  return (
    <Card className="scroll-mt-24 p-5" id="notification-preferences" variant="flat">
      <h2 className="text-sm font-semibold text-ink">
        {locale === "en" ? "Notification preferences" : "تفضيلات الإشعارات"}
      </h2>
      <p className="mt-1 text-xs leading-6 text-muted">{CRITICAL_HINT[locale]}</p>
      <ul className="mt-4 grid gap-3">
        {(Object.keys(PREFERENCE_LABELS) as Array<keyof NotificationPreferences>).map(
          (key) => (
            <li className="flex items-center justify-between gap-3" key={key}>
              <span className="text-sm text-ink">{PREFERENCE_LABELS[key][locale]}</span>
              <input
                checked={prefs[key]}
                className="size-4 accent-[var(--color-secondary)]"
                onChange={(event) => void toggle(key, event.target.checked)}
                type="checkbox"
              />
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}

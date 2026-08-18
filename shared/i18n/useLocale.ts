"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  getStoredLocale,
  subscribeLocale,
  type Locale,
} from "@/shared/i18n/locale";
import { translate, type MessageKey } from "@/shared/i18n/messages";

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getStoredLocale, () => DEFAULT_LOCALE);
}

export function useT() {
  const locale = useLocale();
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}

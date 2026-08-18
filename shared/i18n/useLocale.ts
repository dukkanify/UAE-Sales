"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getLocaleMessages, type LocaleMessages } from "./messages";
import { getStoredLocale, type AppLocale } from "./locale";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
  };
}

export function useLocale(): AppLocale {
  return useSyncExternalStore(subscribe, getStoredLocale, () => "ar");
}

export function useLocaleMessages(): LocaleMessages {
  return getLocaleMessages(useLocale());
}

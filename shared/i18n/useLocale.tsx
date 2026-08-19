"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getLocaleMessages, type LocaleMessages } from "./messages";
import { getStoredLocale, type AppLocale } from "./locale";

const LocaleContext = createContext<AppLocale>("ar");

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENTS.localeChange, onStoreChange);
  };
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: AppLocale;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    getStoredLocale,
    () => initialLocale,
  );
  const value = useMemo(() => locale, [locale]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): AppLocale {
  return useContext(LocaleContext);
}

export function useLocaleMessages(): LocaleMessages {
  return getLocaleMessages(useLocale());
}

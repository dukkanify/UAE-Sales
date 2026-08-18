"use client";

import { useEffect } from "react";
import { applyLocale, getStoredLocale } from "@/shared/i18n/locale";

/** Re-applies the stored locale after hydration. */
export function LocaleSync() {
  useEffect(() => {
    applyLocale(getStoredLocale());
  }, []);
  return null;
}

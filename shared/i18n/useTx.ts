"use client";

import { tx } from "./tx";
import { useLocale } from "./useLocale";

export function useTx() {
  const locale = useLocale();
  return (text: string) => tx(locale, text);
}

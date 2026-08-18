"use client";

import { AppHeader } from "@/shared/layouts/AppHeader";
import type { Category } from "@/types";

type MarketHeaderProps = {
  categories?: Category[];
};

export function MarketHeader({ categories }: MarketHeaderProps) {
  return <AppHeader categories={categories} showStickySearch={false} />;
}

"use client";

import { AppHeader } from "@/shared/layouts/AppHeader";
import type { Category } from "@/types";

type MobileHomeHeaderProps = {
  categories?: Category[];
};

export function MobileHomeHeader({ categories }: MobileHomeHeaderProps) {
  return <AppHeader categories={categories} showStickySearch={false} />;
}

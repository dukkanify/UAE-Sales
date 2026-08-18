"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { getCategoryFilterConfig } from "@/shared/constants/category-filters";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Icon } from "@/shared/ui/Icon";
import { buildSearchUrl, type SearchFilterState } from "./search-url";

type SearchFilterChipsProps = {
  basePath?: string;
  categories: Category[];
  selectedFilters: SearchFilterState;
};

const conditionLabels: Record<string, string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

const sortLabels: Record<string, string> = {
  newest: "الأحدث",
  price_asc: "السعر ↑",
  price_desc: "السعر ↓",
};

export function SearchFilterChips({
  basePath = "/search",
  categories,
  selectedFilters,
}: SearchFilterChipsProps) {
  const categoryName = categories.find((c) => c.id === selectedFilters.category)?.name;
  const config = getCategoryFilterConfig(selectedFilters.category);
  const specLabels = Object.fromEntries(
    [...config.primary, ...config.extra].map((field) => [field.key, field.label]),
  );

  const chips: { key: string; label: React.ReactNode }[] = [];

  if (selectedFilters.query) {
    chips.push({ key: "query", label: `"${selectedFilters.query}"` });
  }
  if (selectedFilters.country) {
    chips.push({ key: "country", label: selectedFilters.country });
  }
  if (selectedFilters.city) {
    chips.push({ key: "city", label: selectedFilters.city });
  }
  if (categoryName && basePath === "/search") {
    chips.push({ key: "category", label: categoryName });
  }
  if (selectedFilters.condition) {
    chips.push({
      key: "condition",
      label: conditionLabels[selectedFilters.condition] ?? selectedFilters.condition,
    });
  }
  for (const [key, value] of Object.entries(selectedFilters.specs ?? {})) {
    if (!value) continue;
    chips.push({
      key,
      label: `${specLabels[key] ?? key}: ${value}`,
    });
  }
  if (selectedFilters.minPrice) {
    chips.push({
      key: "minPrice",
      label: (
        <span className="inline-flex items-center gap-1">
          من <CurrencyAmount amount={Number(selectedFilters.minPrice)} size="sm" />
        </span>
      ),
    });
  }
  if (selectedFilters.maxPrice) {
    chips.push({
      key: "maxPrice",
      label: (
        <span className="inline-flex items-center gap-1">
          حتى <CurrencyAmount amount={Number(selectedFilters.maxPrice)} size="sm" />
        </span>
      ),
    });
  }
  if (selectedFilters.sort && selectedFilters.sort !== "newest") {
    chips.push({
      key: "sort",
      label: sortLabels[selectedFilters.sort] ?? selectedFilters.sort,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  const clearHref = basePath === "/search" ? "/search" : basePath;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">
        {chips.length.toLocaleString("ar-AE")} فلتر نشط
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          className="premium-chip interactive-lift gap-1.5 !py-1.5 !text-xs text-ink"
          href={buildSearchUrl(selectedFilters, chip.key, basePath)}
        >
          {chip.label}
          <Icon aria-hidden name="close" size={12} />
          <span className="sr-only">إزالة الفلتر</span>
        </Link>
      ))}
      <Link
        className="text-xs font-semibold text-primary transition hover:text-primary-dark"
        href={clearHref}
      >
        مسح الكل
      </Link>
    </div>
  );
}

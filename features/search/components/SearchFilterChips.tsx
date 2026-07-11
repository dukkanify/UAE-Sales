"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Icon } from "@/shared/ui/Icon";

type SearchFilterChipsProps = {
  categories: Category[];
  selectedFilters: {
    category?: string;
    city?: string;
    condition?: string;
    country?: string;
    maxPrice?: string;
    minPrice?: string;
    query?: string;
    sort?: string;
  };
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

function buildSearchUrl(
  filters: SearchFilterChipsProps["selectedFilters"],
  omitKey?: keyof SearchFilterChipsProps["selectedFilters"],
) {
  const params = new URLSearchParams();

  if (filters.query && omitKey !== "query") {
    params.set("q", filters.query);
  }
  if (filters.country && omitKey !== "country") {
    params.set("country", filters.country);
  }
  if (filters.city && omitKey !== "city") {
    params.set("city", filters.city);
  }
  if (filters.category && omitKey !== "category") {
    params.set("category", filters.category);
  }
  if (filters.condition && omitKey !== "condition") {
    params.set("condition", filters.condition);
  }
  if (filters.minPrice && omitKey !== "minPrice") {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice && omitKey !== "maxPrice") {
    params.set("maxPrice", filters.maxPrice);
  }
  if (filters.sort && filters.sort !== "newest" && omitKey !== "sort") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function SearchFilterChips({
  categories,
  selectedFilters,
}: SearchFilterChipsProps) {
  const categoryName = categories.find((c) => c.id === selectedFilters.category)?.name;
  const chips: {
    key: keyof SearchFilterChipsProps["selectedFilters"];
    label: React.ReactNode;
  }[] = [];

  if (selectedFilters.query) {
    chips.push({ key: "query", label: `"${selectedFilters.query}"` });
  }
  if (selectedFilters.country) {
    chips.push({ key: "country", label: selectedFilters.country });
  }
  if (selectedFilters.city) {
    chips.push({ key: "city", label: selectedFilters.city });
  }
  if (categoryName) {
    chips.push({ key: "category", label: categoryName });
  }
  if (selectedFilters.condition) {
    chips.push({
      key: "condition",
      label: conditionLabels[selectedFilters.condition] ?? selectedFilters.condition,
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

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">
        {chips.length.toLocaleString("ar-AE")} فلتر نشط
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          className="premium-chip interactive-lift gap-1.5 !py-1.5 !text-xs text-ink"
          href={buildSearchUrl(selectedFilters, chip.key)}
        >
          {chip.label}
          <Icon aria-hidden name="close" size={12} />
          <span className="sr-only">إزالة الفلتر</span>
        </Link>
      ))}
      <Link
        className="text-xs font-semibold text-primary transition hover:text-primary-dark"
        href="/search"
      >
        مسح الكل
      </Link>
    </div>
  );
}

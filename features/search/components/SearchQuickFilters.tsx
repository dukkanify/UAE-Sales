"use client";

import Link from "next/link";
import type { Category } from "@/types";
import {
  buildSearchUrl,
  mergeSearchFilters,
  type SearchFilterState,
} from "./search-url";

type SearchQuickFiltersProps = {
  categories: Category[];
  selectedFilters: SearchFilterState;
};

type QuickChip = {
  active: boolean;
  href: string;
  label: string;
};

export function SearchQuickFilters({
  categories,
  selectedFilters,
}: SearchQuickFiltersProps) {
  const topCategories = categories.slice(0, 4);

  const chips: QuickChip[] = [
    {
      label: "جديد",
      active: selectedFilters.condition === "new",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          condition: selectedFilters.condition === "new" ? "" : "new",
        }),
      ),
    },
    {
      label: "أقل من 50 ألف",
      active: selectedFilters.maxPrice === "50000" && !selectedFilters.minPrice,
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          maxPrice:
            selectedFilters.maxPrice === "50000" && !selectedFilters.minPrice
              ? ""
              : "50000",
          minPrice: "",
        }),
      ),
    },
    {
      label: "دبي",
      active: selectedFilters.city === "دبي",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          city: selectedFilters.city === "دبي" ? "" : "دبي",
        }),
      ),
    },
    {
      label: "أبوظبي",
      active: selectedFilters.city === "أبوظبي",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          city: selectedFilters.city === "أبوظبي" ? "" : "أبوظبي",
        }),
      ),
    },
    {
      label: "الأرخص",
      active: selectedFilters.sort === "price_asc",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          sort: selectedFilters.sort === "price_asc" ? "newest" : "price_asc",
        }),
      ),
    },
    ...topCategories.map((category) => ({
      label: category.name,
      active: selectedFilters.category === category.id,
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          category:
            selectedFilters.category === category.id ? "" : category.id,
        }),
      ),
    })),
  ];

  return (
    <div className="mb-1">
      <p className="mb-2 text-[0.7rem] font-bold text-muted">فلاتر سريعة</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={`${chip.label}-${chip.href}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              chip.active
                ? "border-[#c9a45c] bg-[#c9a45c] text-[#0b1628]"
                : "border-border bg-white text-ink hover:border-[#c9a45c]/50 hover:bg-[#f8f3ea]"
            }`}
            href={chip.href}
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

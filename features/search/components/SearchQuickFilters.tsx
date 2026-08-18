"use client";

import Link from "next/link";
import type { Category } from "@/types";
import {
  buildSearchUrl,
  mergeSearchFilters,
  type SearchFilterState,
} from "./search-url";

type SearchQuickFiltersProps = {
  basePath?: string;
  categories: Category[];
  selectedFilters: SearchFilterState;
};

type QuickChip = {
  active: boolean;
  href: string;
  label: string;
};

function specChip(
  filters: SearchFilterState,
  basePath: string,
  key: string,
  value: string,
  label: string,
): QuickChip {
  const current = filters.specs?.[key];
  const nextSpecs = { ...filters.specs, [key]: current === value ? "" : value };
  return {
    label,
    active: current === value,
    href: buildSearchUrl(
      mergeSearchFilters(filters, { specs: nextSpecs }),
      undefined,
      basePath,
    ),
  };
}

export function SearchQuickFilters({
  basePath = "/search",
  categories,
  selectedFilters,
}: SearchQuickFiltersProps) {
  const categoryId = selectedFilters.category;

  const chips: QuickChip[] = [
    {
      label: "دبي",
      active: selectedFilters.city === "دبي",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          city: selectedFilters.city === "دبي" ? "" : "دبي",
        }),
        undefined,
        basePath,
      ),
    },
    {
      label: "أبوظبي",
      active: selectedFilters.city === "أبوظبي",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          city: selectedFilters.city === "أبوظبي" ? "" : "أبوظبي",
        }),
        undefined,
        basePath,
      ),
    },
  ];

  if (categoryId === "cars") {
    chips.push(
      specChip(selectedFilters, basePath, "brand", "Toyota", "تويوتا"),
      specChip(selectedFilters, basePath, "brand", "Nissan", "نيسان"),
      specChip(selectedFilters, basePath, "year", "2024", "2024"),
    );
  } else if (categoryId === "real-estate") {
    chips.push(
      specChip(selectedFilters, basePath, "propertyType", "شقة", "شقة"),
      specChip(selectedFilters, basePath, "propertyType", "فيلا", "فيلا"),
      specChip(selectedFilters, basePath, "purpose", "للإيجار", "للإيجار"),
    );
  } else if (categoryId === "mobiles") {
    chips.push(
      specChip(selectedFilters, basePath, "brand", "Apple", "Apple"),
      specChip(selectedFilters, basePath, "brand", "Samsung", "سامسونج"),
      specChip(selectedFilters, basePath, "storage", "128 GB", "128 GB"),
    );
  } else if (categoryId === "electronics") {
    chips.push(
      specChip(selectedFilters, basePath, "brand", "Apple", "Apple"),
      specChip(selectedFilters, basePath, "brand", "Sony", "سوني"),
    );
  } else if (categoryId === "jobs") {
    chips.push(
      specChip(selectedFilters, basePath, "employmentType", "دوام كامل", "دوام كامل"),
      specChip(selectedFilters, basePath, "employmentType", "عن بُعد", "عن بُعد"),
    );
  } else if (categoryId === "food") {
    chips.push(
      specChip(selectedFilters, basePath, "cuisine", "إماراتي", "إماراتي"),
      specChip(selectedFilters, basePath, "delivery", "توصيل متاح", "توصيل"),
    );
  } else {
    chips.unshift({
      label: "جديد",
      active: selectedFilters.condition === "new",
      href: buildSearchUrl(
        mergeSearchFilters(selectedFilters, {
          condition: selectedFilters.condition === "new" ? "" : "new",
        }),
        undefined,
        basePath,
      ),
    });
    if (!categoryId) {
      const topCategories = categories.slice(0, 3);
      chips.push(
        ...topCategories.map((category) => ({
          label: category.name,
          active: selectedFilters.category === category.id,
          href: buildSearchUrl(
            mergeSearchFilters(selectedFilters, {
              category:
                selectedFilters.category === category.id ? "" : category.id,
            }),
            undefined,
            basePath,
          ),
        })),
      );
    }
  }

  chips.push({
    label: "الأرخص",
    active: selectedFilters.sort === "price_asc",
    href: buildSearchUrl(
      mergeSearchFilters(selectedFilters, {
        sort: selectedFilters.sort === "price_asc" ? "newest" : "price_asc",
      }),
      undefined,
      basePath,
    ),
  });

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
                : "border-border bg-surface text-ink hover:border-[#c9a45c]/50 hover:bg-secondary-soft"
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

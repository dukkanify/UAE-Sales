"use client";

import { useEffect, useState } from "react";
import type { Category, City } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Icon } from "@/shared/ui/Icon";

type SearchFiltersProps = {
  action?: string;
  categories: Category[];
  cities: City[];
  countries: {
    id: string;
    name: string;
  }[];
  layout?: "bar" | "sidebar";
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
  showCategory?: boolean;
};

const sortOptions = [
  { label: "الأحدث", value: "newest" },
  { label: "السعر ↑", value: "price_asc" },
  { label: "السعر ↓", value: "price_desc" },
];

const conditionOptions = [
  { label: "الكل", value: "" },
  { label: "جديد", value: "new" },
  { label: "مستعمل", value: "used" },
  { label: "ممتاز", value: "excellent" },
];

export function SearchFilters({
  action = "/search",
  categories,
  cities,
  countries,
  layout = "bar",
  selectedFilters,
  showCategory = true,
}: SearchFiltersProps) {
  const isSidebar = layout === "sidebar";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setMobileOpen(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const activeCount = [
    selectedFilters.query,
    selectedFilters.city,
    selectedFilters.category,
    selectedFilters.condition,
    selectedFilters.minPrice,
    selectedFilters.maxPrice,
    selectedFilters.sort !== "newest" ? selectedFilters.sort : "",
  ].filter(Boolean).length;

  if (!isSidebar) {
    return (
      <div className="marketplace-panel p-5 md:p-6">
        <form
          action={action}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        >
          <Input
            defaultValue={selectedFilters.query}
            label="كلمة البحث"
            name="q"
            placeholder="سيارة، هاتف، عقار..."
          />
          <Select
            defaultValue={selectedFilters.country}
            label="الدولة"
            name="country"
            options={[
              { label: "كل الدول", value: "" },
              ...countries.map((country) => ({
                label: country.name,
                value: country.name,
              })),
            ]}
          />
          <Select
            defaultValue={selectedFilters.city}
            label="الإمارة"
            name="city"
            options={[
              { label: "كل المدن", value: "" },
              ...cities.map((city) => ({ label: city.name, value: city.name })),
            ]}
          />
          {showCategory ? (
            <Select
              defaultValue={selectedFilters.category}
              label="التصنيف"
              name="category"
              options={[
                { label: "كل التصنيفات", value: "" },
                ...categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
            />
          ) : null}
          <Select
            defaultValue={selectedFilters.condition}
            label="الحالة"
            name="condition"
            options={conditionOptions}
          />
          <Input
            defaultValue={selectedFilters.minPrice}
            inputMode="numeric"
            label="أقل سعر"
            min="0"
            name="minPrice"
            placeholder="0"
            type="number"
          />
          <Input
            defaultValue={selectedFilters.maxPrice}
            inputMode="numeric"
            label="أعلى سعر"
            min="0"
            name="maxPrice"
            placeholder="50000"
            type="number"
          />
          <div className="grid gap-2">
            <Select
              defaultValue={selectedFilters.sort}
              label="الترتيب"
              name="sort"
              options={sortOptions}
            />
            <Button className="mt-auto w-full" type="submit" variant="primary">
              تطبيق الفلاتر
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="marketplace-panel overflow-hidden p-0">
      <button
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3 text-start lg:hidden"
        onClick={() => setMobileOpen((open) => !open)}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="text-secondary" name="filter" size={16} />
          <span className="text-sm font-bold text-ink">تصفية النتائج</span>
          {activeCount > 0 ? (
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[0.65rem] font-bold text-[#8a7040]">
              {activeCount}
            </span>
          ) : null}
        </span>
        <Icon
          className={`text-muted transition ${mobileOpen ? "rotate-90" : "-rotate-90"}`}
          name="chevron-left"
          size={16}
        />
      </button>

      <div className={`px-4 py-3 ${mobileOpen ? "block" : "hidden"} lg:block`}>
        <h2 className="mb-2 hidden text-xs font-bold text-ink lg:block">تصفية النتائج</h2>

        <form action={action} className="grid gap-2.5">
          <Input
            compact
            defaultValue={selectedFilters.query}
            label="كلمة البحث"
            name="q"
            placeholder="سيارة، هاتف، عقار..."
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              compact
              defaultValue={selectedFilters.city}
              label="الإمارة"
              name="city"
              options={[
                { label: "كل الإمارات", value: "" },
                ...cities.map((city) => ({ label: city.name, value: city.name })),
              ]}
            />
            {showCategory ? (
              <Select
                compact
                defaultValue={selectedFilters.category}
                label="التصنيف"
                name="category"
                options={[
                  { label: "كل التصنيفات", value: "" },
                  ...categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  })),
                ]}
              />
            ) : (
              <Select
                compact
                defaultValue={selectedFilters.sort}
                label="الترتيب"
                name="sort"
                options={sortOptions}
              />
            )}
          </div>

          <details className="group rounded-xl border border-border/80 bg-surface-muted/35 open:pb-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold text-ink marker:content-none">
              <span className="inline-flex items-center gap-1.5">
                <Icon className="text-secondary" name="filter" size={14} />
                فلاتر متقدمة
              </span>
              <Icon
                className="text-muted transition group-open:rotate-180"
                name="chevron-left"
                size={14}
              />
            </summary>
            <div className="grid gap-2 border-t border-border/70 px-3 pt-2.5">
              <div className={showCategory ? "grid grid-cols-2 gap-2" : ""}>
                <Select
                  compact
                  defaultValue={selectedFilters.condition}
                  label="الحالة"
                  name="condition"
                  options={conditionOptions}
                />
                {showCategory ? (
                  <Select
                    compact
                    defaultValue={selectedFilters.sort}
                    label="الترتيب"
                    name="sort"
                    options={sortOptions}
                  />
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  compact
                  defaultValue={selectedFilters.minPrice}
                  inputMode="numeric"
                  label="أقل سعر (د.إ)"
                  min="0"
                  name="minPrice"
                  placeholder="0"
                  type="number"
                />
                <Input
                  compact
                  defaultValue={selectedFilters.maxPrice}
                  inputMode="numeric"
                  label="أعلى سعر (د.إ)"
                  min="0"
                  name="maxPrice"
                  placeholder="أي سعر"
                  type="number"
                />
              </div>
            </div>
          </details>

          <Button className="w-full" size="sm" type="submit" variant="primary">
            تطبيق الفلاتر
          </Button>
        </form>
      </div>
    </div>
  );
}

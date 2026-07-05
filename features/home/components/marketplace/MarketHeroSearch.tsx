"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type MarketHeroSearchProps = {
  categories: Category[];
};

export function MarketHeroSearch({ categories }: MarketHeroSearchProps) {
  return (
    <form
      action="/search"
      className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_72px_rgb(15_20_25/14%)] ring-1 ring-black/[0.04]"
    >
      <div className="h-1 uae-gold-gradient" />
      <div className="p-4 sm:p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] lg:items-end lg:gap-4">
          <label className="grid gap-2 sm:col-span-2 lg:col-span-1">
            <span className="text-sm font-bold text-ink">ماذا تبحث عنه؟</span>
            <div className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-[#fdfbf7] px-4 focus-within:border-[#B8955F]/40 focus-within:ring-2 focus-within:ring-[#B8955F]/12">
              <Icon className="shrink-0 text-[#B8955F]" name="search" size={22} />
              <input
                className="w-full bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted/50"
                name="q"
                placeholder="سيارات، عقارات، إلكترونيات، خدمات..."
                type="search"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">التصنيف</span>
            <select
              className="min-h-14 w-full rounded-xl border border-border bg-[#fdfbf7] px-4 text-base font-semibold text-ink outline-none focus:border-[#B8955F]/40 focus:ring-2 focus:ring-[#B8955F]/12"
              defaultValue=""
              name="category"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">الإمارة</span>
            <select
              className="min-h-14 w-full rounded-xl border border-border bg-[#fdfbf7] px-4 text-base font-semibold text-ink outline-none focus:border-[#B8955F]/40 focus:ring-2 focus:ring-[#B8955F]/12"
              defaultValue=""
              name="city"
            >
              <option value="">كل الإمارات</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="uae-gold-gradient flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl px-8 text-base font-bold text-white shadow-[0_10px_32px_rgb(184_149_95/35%)] transition hover:brightness-105 sm:col-span-2 lg:col-span-1 lg:w-auto"
            type="submit"
          >
            <Icon name="search" size={20} />
            بحث
          </button>
        </div>
      </div>
    </form>
  );
}

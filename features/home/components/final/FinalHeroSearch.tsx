"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type FinalHeroSearchProps = {
  categories: Category[];
  popularSearches: { href: string; label: string }[];
};

export function FinalHeroSearch({
  categories,
  popularSearches,
}: FinalHeroSearchProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#B8955F]/12 bg-white shadow-[0_20px_56px_rgb(15_20_25/11%)] ring-1 ring-black/[0.04]">
      <div className="h-1 uae-gold-gradient" />

      <div className="p-4 sm:p-5 md:p-6">
        <form action="/search">
          <div className="grid gap-3.5 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end md:gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-ink">ماذا تبحث عنه؟</span>
              <div className="flex min-h-[3.25rem] items-center gap-2.5 rounded-xl border border-border bg-[#fdfbf7] px-3.5 transition focus-within:border-[#B8955F]/35 focus-within:ring-2 focus-within:ring-[#B8955F]/10 sm:min-h-14 sm:gap-3 sm:px-4">
                <Icon className="shrink-0 text-[#B8955F]" name="search" size={19} />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/55 sm:text-base"
                  name="q"
                  placeholder="سيارة، فيلا، آيفون..."
                  type="search"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-ink">التصنيف</span>
              <select
                className="min-h-[3.25rem] w-full rounded-xl border border-border bg-[#fdfbf7] px-3.5 text-sm font-semibold text-ink outline-none transition focus:border-[#B8955F]/35 focus:ring-2 focus:ring-[#B8955F]/10 sm:min-h-14 sm:px-4 sm:text-base"
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
                className="min-h-[3.25rem] w-full rounded-xl border border-border bg-[#fdfbf7] px-3.5 text-sm font-semibold text-ink outline-none transition focus:border-[#B8955F]/35 focus:ring-2 focus:ring-[#B8955F]/10 sm:min-h-14 sm:px-4 sm:text-base"
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
              className="uae-gold-gradient inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgb(184_149_95/30%)] transition hover:brightness-105 sm:min-h-14 sm:px-7 sm:text-base md:w-auto"
              type="submit"
            >
              <Icon name="search" size={19} />
              بحث
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <span className="text-xs font-bold text-muted">عمليات بحث شائعة:</span>
          {popularSearches.map((tag) => (
            <Link
              key={tag.href}
              className="rounded-full border border-[#B8955F]/18 bg-[#B8955F]/5 px-3 py-1 text-xs font-bold text-ink transition hover:border-[#B8955F]/30 hover:bg-[#B8955F]/10"
              href={tag.href}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div className="overflow-hidden rounded-[1.5rem] border border-[#B8955F]/15 bg-white shadow-[0_24px_64px_rgb(15_20_25/12%)] ring-1 ring-black/[0.03]">
      <div className="h-1 uae-gold-gradient" />

      <div className="p-5 md:p-7">
        <form action="/search">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end md:gap-5">
            <label className="grid gap-2.5">
              <span className="text-sm font-bold text-ink">ماذا تبحث عنه؟</span>
              <div className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-[#fdfbf7] px-4 transition focus-within:border-[#B8955F]/40 focus-within:ring-2 focus-within:ring-[#B8955F]/12">
                <Icon className="shrink-0 text-[#B8955F]" name="search" size={20} />
                <input
                  className="w-full bg-transparent text-base font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/50"
                  name="q"
                  placeholder="سيارة، فيلا، آيفون..."
                  type="search"
                />
              </div>
            </label>

            <label className="grid gap-2.5">
              <span className="text-sm font-bold text-ink">التصنيف</span>
              <select
                className="min-h-14 w-full rounded-xl border border-border bg-[#fdfbf7] px-4 text-base font-semibold text-ink outline-none transition focus:border-[#B8955F]/40 focus:ring-2 focus:ring-[#B8955F]/12"
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

            <label className="grid gap-2.5">
              <span className="text-sm font-bold text-ink">الإمارة</span>
              <select
                className="min-h-14 w-full rounded-xl border border-border bg-[#fdfbf7] px-4 text-base font-semibold text-ink outline-none transition focus:border-[#B8955F]/40 focus:ring-2 focus:ring-[#B8955F]/12"
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
              className="uae-gold-gradient inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl px-8 text-base font-bold text-white shadow-[0_10px_28px_rgb(184_149_95/35%)] transition hover:brightness-105 md:w-auto"
              type="submit"
            >
              <Icon name="search" size={20} />
              بحث
            </button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-5">
          <span className="text-xs font-bold text-muted">عمليات بحث شائعة:</span>
          {popularSearches.map((tag) => (
            <Link
              key={tag.href}
              className="rounded-full border border-[#B8955F]/20 bg-[#B8955F]/6 px-3.5 py-1.5 text-xs font-bold text-ink transition hover:border-[#B8955F]/35 hover:bg-[#B8955F]/12"
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

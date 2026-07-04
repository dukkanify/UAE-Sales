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
    <div className="rounded-[1.5rem] border border-border/70 bg-white p-5 shadow-[0_20px_50px_rgb(15_20_25/10%)] md:p-6">
      <form action="/search">
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end md:gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">ماذا تبحث عنه؟</span>
            <div className="flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-border bg-surface-muted/40 px-4">
              <Icon className="shrink-0 text-muted" name="search" size={18} />
              <input
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/55"
                name="q"
                placeholder="سيارة، فيلا، آيفون..."
                type="search"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">التصنيف</span>
            <select
              className="min-h-[3.25rem] w-full rounded-xl border border-border bg-surface-muted/40 px-4 text-sm font-medium text-ink outline-none"
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
              className="min-h-[3.25rem] w-full rounded-xl border border-border bg-surface-muted/40 px-4 text-sm font-medium text-ink outline-none"
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
            className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-[#B8955F] px-7 text-sm font-bold text-white shadow-[0_8px_24px_rgb(184_149_95/30%)] transition hover:bg-[#a6844f] md:w-auto"
            type="submit"
          >
            <Icon name="search" size={18} />
            بحث
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <span className="text-xs font-semibold text-muted">عمليات بحث شائعة:</span>
        {popularSearches.map((tag) => (
          <Link
            key={tag.href}
            className="rounded-full border border-border bg-surface-muted/50 px-3 py-1 text-xs font-semibold text-ink transition hover:border-[#B8955F]/30 hover:bg-[#B8955F]/8"
            href={tag.href}
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

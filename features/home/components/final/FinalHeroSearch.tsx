"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

type FinalHeroSearchProps = {
  categories: Category[];
};

export function FinalHeroSearch({ categories }: FinalHeroSearchProps) {
  return (
    <form
      action="/search"
      className="rounded-[var(--radius-2xl)] border border-border bg-white p-4 shadow-[var(--shadow-card)] md:p-5"
    >
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-muted">ماذا تبحث عنه؟</span>
          <div className="flex min-h-12 items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 px-4">
            <Icon className="shrink-0 text-muted" name="search" size={18} />
            <input
              className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/60"
              name="q"
              placeholder="سيارة، شقة، آيفون..."
              type="search"
            />
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold text-muted">التصنيف</span>
          <select
            className="min-h-12 w-full rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 px-4 text-sm font-medium text-ink outline-none"
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
          <span className="text-xs font-semibold text-muted">الإمارة</span>
          <select
            className="min-h-12 w-full rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 px-4 text-sm font-medium text-ink outline-none"
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

        <Button className="min-h-12 w-full md:w-auto" size="lg" type="submit" variant="primary">
          <Icon name="search" size={18} />
          بحث
        </Button>
      </div>
    </form>
  );
}

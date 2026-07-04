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
      className="rounded-[var(--radius-2xl)] border border-border/80 bg-white p-5 shadow-[0_8px_40px_rgb(15_20_25/10%)] md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end md:gap-5">
        <label className="grid gap-2.5">
          <span className="text-sm font-semibold text-ink">ماذا تبحث عنه؟</span>
          <div className="flex min-h-14 items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted/50 px-4">
            <Icon className="shrink-0 text-muted" name="search" size={20} />
            <input
              className="w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-muted/55"
              name="q"
              placeholder="سيارة، فيلا، آيفون، وظيفة..."
              type="search"
            />
          </div>
        </label>

        <label className="grid gap-2.5">
          <span className="text-sm font-semibold text-ink">التصنيف</span>
          <select
            className="min-h-14 w-full rounded-[var(--radius-xl)] border border-border bg-surface-muted/50 px-4 text-base font-medium text-ink outline-none"
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
          <span className="text-sm font-semibold text-ink">الإمارة</span>
          <select
            className="min-h-14 w-full rounded-[var(--radius-xl)] border border-border bg-surface-muted/50 px-4 text-base font-medium text-ink outline-none"
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

        <Button
          className="min-h-14 w-full px-7 text-base md:w-auto"
          size="lg"
          type="submit"
          variant="primary"
        >
          <Icon name="search" size={20} />
          بحث
        </Button>
      </div>
    </form>
  );
}

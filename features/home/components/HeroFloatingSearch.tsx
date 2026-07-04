import Link from "next/link";
import { cities, countries } from "@/shared/constants/locations";
import type { Category } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getHomeQuickSearchTags } from "@/services/content";

type HeroFloatingSearchProps = {
  categories: Category[];
};

export async function HeroFloatingSearch({ categories }: HeroFloatingSearchProps) {
  const quickTags = await getHomeQuickSearchTags();

  return (
    <div className="relative z-20 -mt-8 px-1 sm:-mt-12 lg:-mt-14">
      <div className="app-container">
        <form
          action="/search"
          className="hero-floating-search mx-auto max-w-5xl overflow-hidden rounded-[var(--radius-2xl)] border border-white/60 bg-white/96 p-2.5 shadow-[var(--shadow-xl)] backdrop-blur-2xl md:rounded-full md:p-2"
        >
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <label className="flex min-h-[3.25rem] min-w-0 items-center gap-2.5 rounded-[var(--radius-xl)] border border-border/60 bg-surface px-4 md:col-span-2 md:rounded-full lg:col-span-1">
              <Icon className="shrink-0 text-secondary" name="search" size={18} />
              <input
                aria-label="كلمة البحث"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/70"
                name="q"
                placeholder="ابحث عن أي شيء..."
                type="search"
              />
            </label>

            <label className="flex min-h-[3.25rem] min-w-0 items-center rounded-[var(--radius-xl)] border border-border/60 bg-surface px-4 md:rounded-full">
              <select
                aria-label="التصنيف"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none"
                name="category"
              >
                <option value="">كل التصنيفات</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-h-[3.25rem] min-w-0 items-center rounded-[var(--radius-xl)] border border-border/60 bg-surface px-4 md:rounded-full">
              <select
                aria-label="الإمارة"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none"
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
              className="h-[3.25rem] min-h-[3.25rem] w-full shrink-0 justify-center gap-2 whitespace-nowrap rounded-[var(--radius-xl)] px-6 md:rounded-full lg:w-auto lg:px-8"
              size="lg"
              type="submit"
              variant="accent"
            >
              <Icon className="shrink-0" name="search" size={18} />
              <span>بحث</span>
            </Button>
          </div>
          <input name="country" type="hidden" value={countries[0].name} />
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-1 sm:mt-4">
          <span className="text-xs font-semibold text-muted">بحث سريع:</span>
          {quickTags.map((tag) => (
            <Link
              key={tag.label}
              className="premium-chip interactive-lift max-w-full truncate"
              href={tag.href}
              title={tag.label}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

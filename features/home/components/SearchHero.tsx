import Link from "next/link";
import { cities, countries } from "@/shared/constants/locations";
import type { Category, HomeTrustPoint } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeQuickSearchTags, getHomeTrustPoints } from "@/services/content";
import { getFeaturedListings } from "@/services/listings";
import { HeroBackground } from "./HeroBackground";
import { HeroShowcase } from "./HeroShowcase";

type SearchHeroProps = {
  categories: Category[];
  trustPoints?: HomeTrustPoint[];
};

export async function SearchHero({ categories, trustPoints }: SearchHeroProps) {
  const [points, quickTags, featuredListings] = await Promise.all([
    trustPoints ?? getHomeTrustPoints(),
    getHomeQuickSearchTags(),
    getFeaturedListings(),
  ]);

  return (
    <section className="relative border-b border-border bg-[var(--color-background)]">
      <HeroBackground />

      <div className="app-container relative section-padding pb-20 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-secondary">UAE Sales</p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
            بيع وشراء بثقة في الإمارات
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-8 text-muted sm:text-lg">
            منصة إماراتية للإعلانات المبوبة مع ضمان مالي يحمي المشتري والبائع.
            ابحث، قارن، وتواصل بأمان.
          </p>

          <form
            action="/search"
            className="mx-auto mt-10 rounded-[var(--radius-2xl)] border border-border bg-surface p-3 shadow-[var(--shadow-soft)] sm:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4 sm:col-span-2 lg:col-span-1">
                <Icon className="shrink-0 text-muted" name="search" size={18} />
                <input
                  aria-label="كلمة البحث"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
                  name="q"
                  placeholder="ابحث عن سيارات، عقارات، إلكترونيات..."
                  type="search"
                />
              </label>

              <label className="flex min-h-12 items-center rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4">
                <select
                  aria-label="التصنيف"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
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

              <label className="flex min-h-12 items-center rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4">
                <select
                  aria-label="الإمارة"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
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
                className="h-12 min-h-12 w-full shrink-0 whitespace-nowrap px-8 lg:w-auto"
                size="lg"
                type="submit"
                variant="primary"
              >
                بحث
              </Button>
            </div>
            <input name="country" type="hidden" value={countries[0].name} />
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {quickTags.map((tag) => (
              <Link
                key={tag.label}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-secondary/40 hover:text-ink"
                href={tag.href}
              >
                {tag.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {points.map((point) => (
              <span key={point.label} className="inline-flex items-center gap-2">
                <Icon className="text-secondary" name={point.icon as IconName} size={15} />
                {point.label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="h-12 whitespace-nowrap px-8" href="/listings/new" size="lg" variant="accent">
              أضف إعلانك الآن
            </Button>
            <Button className="h-12 whitespace-nowrap px-8" href="/search" size="lg" variant="secondary">
              تصفح الإعلانات
            </Button>
          </div>
        </div>

        <HeroShowcase listings={featuredListings.slice(0, 2)} />
      </div>
    </section>
  );
}

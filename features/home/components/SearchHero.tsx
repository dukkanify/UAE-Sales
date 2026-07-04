import Link from "next/link";
import { cities, countries } from "@/shared/constants/locations";
import type { Category, HomeTrustPoint } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeQuickSearchTags, getHomeTrustPoints } from "@/services/content";
import { getFeaturedListings } from "@/services/listings";
import { HeroBackground } from "./HeroBackground";
import { HeroMarketplaceCollage } from "./HeroMarketplaceCollage";

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
    <section className="relative overflow-hidden bg-[var(--color-background)]">
      <HeroBackground />

      <div className="app-container relative section-padding pb-16 pt-10 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          <div className="min-w-0 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-surface px-3.5 py-2 text-xs font-bold text-primary shadow-[var(--shadow-xs)]">
              <Icon className="text-secondary" name="shield" size={14} />
              منصة إماراتية بضمان مالي
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-[3.55rem] lg:leading-[1.08]">
              بيع وشراء بثقة في الإمارات
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-muted sm:text-lg lg:mx-0">
              منصة إماراتية ذكية للإعلانات المبوبة، تجمع بين سهولة البيع والشراء
              ونظام ضمان مالي يحمي حقوق المشتري والبائع.
            </p>

            <form
              action="/search"
              className="mx-auto mt-8 rounded-[var(--radius-2xl)] border border-border bg-surface p-3 shadow-[0_24px_70px_rgb(15_20_25/10)] sm:p-4 lg:mx-0"
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-[var(--radius-lg)] bg-secondary-soft text-secondary">
                    <Icon name="search" size={15} />
                  </span>
                  <div className="text-start">
                    <p className="text-xs font-black text-ink">بحث ذكي في السوق</p>
                    <p className="text-[0.68rem] font-medium text-muted">
                      سيارات، عقارات، أجهزة، وخدمات في الإمارات
                    </p>
                  </div>
                </div>
                <span className="hidden rounded-full bg-surface-muted px-3 py-1 text-[0.68rem] font-bold text-muted sm:inline-flex">
                  +24,000 إعلان
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto]">
                <label className="flex min-h-[3.25rem] items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4">
                  <Icon className="shrink-0 text-secondary" name="search" size={18} />
                  <input
                    aria-label="ماذا تبحث عنه؟"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                    name="q"
                    placeholder="ماذا تبحث عنه؟"
                    type="search"
                  />
                </label>

                <label className="flex min-h-[3.25rem] items-center rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4">
                  <select
                    aria-label="التصنيف"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none"
                    name="category"
                  >
                    <option value="">التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-h-[3.25rem] items-center rounded-[var(--radius-xl)] border border-border bg-surface-muted/60 px-4">
                  <select
                    aria-label="الإمارة"
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-ink outline-none"
                    name="city"
                  >
                    <option value="">الإمارة</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  className="min-h-[3.25rem] w-full shrink-0 whitespace-nowrap rounded-[var(--radius-xl)] px-8 lg:w-auto"
                  size="lg"
                  type="submit"
                  variant="accent"
                >
                  بحث
                </Button>
              </div>
              <input name="country" type="hidden" value={countries[0].name} />
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {quickTags.map((tag) => (
                <Link
                  key={tag.label}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-secondary/40 hover:text-ink"
                  href={tag.href}
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button className="h-12 whitespace-nowrap px-8" href="/listings/new" size="lg" variant="primary">
                أضف إعلانك الآن
              </Button>
              <Button className="h-12 whitespace-nowrap px-8" href="/search" size="lg" variant="secondary">
                تصفح الإعلانات
              </Button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
              {points.map((point) => (
                <div
                  key={point.label}
                  className="rounded-[var(--radius-xl)] border border-border bg-surface/80 px-3 py-3 text-center shadow-[var(--shadow-xs)]"
                >
                  <Icon className="mx-auto text-secondary" name={point.icon as IconName} size={16} />
                  <p className="mt-2 truncate text-xs font-bold text-ink">{point.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroMarketplaceCollage listings={featuredListings} />
        </div>
      </div>
    </section>
  );
}

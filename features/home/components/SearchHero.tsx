import { cities, countries } from "@/shared/constants/locations";
import type { Category, HomeTrustPoint } from "@/types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeTrustPoints } from "@/services/content";
import { getFeaturedListings } from "@/services/listings";
import { HeroBackground } from "./HeroBackground";
import { HeroPreviewStack } from "./HeroPreviewStack";

type SearchHeroProps = {
  categories: Category[];
  trustPoints?: HomeTrustPoint[];
};

export async function SearchHero({ categories, trustPoints }: SearchHeroProps) {
  const [points, featuredListings] = await Promise.all([
    trustPoints ?? getHomeTrustPoints(),
    getFeaturedListings(),
  ]);

  const previewListings = featuredListings.slice(0, 3);

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <div className="app-container relative z-10 section-padding pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="animate-fade-up text-center lg:text-start">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur-sm" variant="premium">
              السوق الإماراتي الفاخر 2026
            </Badge>

            <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem] xl:text-[3.65rem]">
              بيع وشراء بثقة
              <span className="mt-1 block text-secondary">في الإمارات</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-8 text-white/82 sm:text-lg lg:mx-0">
              منصة إماراتية فاخرة للإعلانات المبوبة، تجمع بين سهولة البيع والشراء
              ونظام ضمان مالي يحمي حقوق المشتري والبائع.
            </p>

            <form
              action="/search"
              className="hero-search-panel mx-auto mt-8 max-w-2xl rounded-[var(--radius-2xl)] border border-white/20 bg-white/92 p-3 shadow-[var(--shadow-xl)] backdrop-blur-xl lg:mx-0"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="flex min-h-12 items-center gap-2.5 rounded-[var(--radius-xl)] border border-border/70 bg-surface px-3.5 sm:col-span-2 lg:col-span-1">
                  <Icon className="shrink-0 text-secondary" name="search" size={18} />
                  <input
                    aria-label="كلمة البحث"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/70"
                    name="q"
                    placeholder="ما الذي تبحث عنه؟"
                    type="search"
                  />
                </label>

                <label className="flex min-h-12 items-center rounded-[var(--radius-xl)] border border-border/70 bg-surface px-3.5">
                  <select
                    aria-label="التصنيف"
                    className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
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

                <label className="flex min-h-12 items-center rounded-[var(--radius-xl)] border border-border/70 bg-surface px-3.5">
                  <select
                    aria-label="الإمارة"
                    className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
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
                  className="h-12 min-h-12 w-full shrink-0 whitespace-nowrap px-7 lg:w-auto"
                  size="lg"
                  type="submit"
                  variant="primary"
                >
                  بحث
                </Button>
              </div>
              <input name="country" type="hidden" value={countries[0].name} />
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                className="h-12 min-h-12 w-full whitespace-nowrap px-7 sm:w-auto"
                href="/listings/new"
                size="lg"
                variant="accent"
              >
                أضف إعلانك الآن
              </Button>
              <Button
                className="h-12 min-h-12 w-full border border-white/30 bg-white/10 px-7 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                href="/search"
                size="lg"
                variant="ghost"
              >
                تصفح الإعلانات
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {points.map((point) => (
                <span
                  key={point.label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/78"
                >
                  <Icon className="text-secondary" name={point.icon as IconName} size={14} />
                  {point.label}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <HeroPreviewStack listings={previewListings} />
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Category, HomeTrustPoint } from "@/types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeTrustPoints } from "@/services/content";
import { getFeaturedListings } from "@/services/listings";
import { HeroBackground } from "./HeroBackground";
import { HeroFloatingSearch } from "./HeroFloatingSearch";
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
    <section className="relative isolate overflow-hidden pb-6">
      <HeroBackground />

      <div className="app-container relative z-10 section-padding pb-8 pt-10 sm:pt-12 lg:pb-10 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 xl:gap-14">
          <div className="animate-fade-up text-center lg:text-start">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur-sm" variant="premium">
              السوق الإماراتي الفاخر 2026
            </Badge>

            <h1 className="text-[2.35rem] font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem]">
              بيع وشراء بثقة
              <span className="mt-1 block bg-gradient-to-l from-secondary via-[#e8d5a8] to-secondary bg-clip-text text-transparent">
                في الإمارات
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-8 text-white/85 sm:text-lg lg:mx-0">
              منصة إماراتية فاخرة للإعلانات المبوبة، تجمع بين سهولة البيع والشراء
              ونظام ضمان مالي يحمي حقوق المشتري والبائع.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                className="h-12 min-h-12 w-full gap-2 whitespace-nowrap px-7 sm:w-auto"
                href="/listings/new"
                size="lg"
                variant="accent"
              >
                <Icon name="plus" size={18} />
                أضف إعلانك الآن
              </Button>
              <Button
                className="h-12 min-h-12 w-full gap-2 border border-white/30 bg-white/10 px-7 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                href="/search"
                size="lg"
                variant="ghost"
              >
                <Icon name="search" size={18} />
                تصفح الإعلانات
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {points.map((point) => (
                <div
                  key={point.label}
                  className="flex items-center justify-center gap-2.5 rounded-[var(--radius-xl)] border border-white/15 bg-white/8 px-3 py-2.5 backdrop-blur-md lg:justify-start"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-secondary/20 text-secondary">
                    <Icon name={point.icon as IconName} size={15} />
                  </span>
                  <span className="text-xs font-bold text-white/90">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <HeroPreviewStack listings={previewListings} />
          </div>
        </div>
      </div>

      <HeroFloatingSearch categories={categories} />
    </section>
  );
}

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
    <section className="relative isolate overflow-hidden pb-4 sm:pb-6">
      <HeroBackground />

      <div className="app-container relative z-10 section-padding pb-6 pt-10 sm:pb-8 sm:pt-12 lg:pb-10 lg:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-14">
          <div className="animate-fade-up min-w-0 text-center lg:text-start">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur-sm" variant="premium">
              السوق الإماراتي الفاخر 2026
            </Badge>

            <h1 className="text-[2.1rem] font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.35rem] xl:text-[3.65rem]">
              بيع وشراء بثقة
              <span className="mt-1 block text-secondary sm:bg-gradient-to-l sm:from-secondary sm:via-[#e8d5a8] sm:to-secondary sm:bg-clip-text sm:text-transparent">
                في الإمارات
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-8 text-white/90 sm:text-lg lg:mx-0">
              منصة إماراتية فاخرة للإعلانات المبوبة، تجمع بين سهولة البيع والشراء
              ونظام ضمان مالي يحمي حقوق المشتري والبائع.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                className="h-12 min-h-12 w-full justify-center gap-2 whitespace-nowrap px-5 sm:w-auto sm:px-7"
                href="/listings/new"
                size="lg"
                variant="accent"
              >
                <Icon className="shrink-0" name="plus" size={18} />
                <span>أضف إعلانك الآن</span>
              </Button>
              <Button
                className="h-12 min-h-12 w-full justify-center gap-2 border border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white sm:w-auto sm:px-7"
                href="/search"
                size="lg"
                variant="ghost"
              >
                <Icon className="shrink-0" name="search" size={18} />
                <span>تصفح الإعلانات</span>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
              {points.map((point) => (
                <div
                  key={point.label}
                  className="flex min-w-0 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-white/15 bg-white/8 px-2.5 py-2.5 backdrop-blur-md sm:gap-2.5 sm:px-3 lg:justify-start"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-secondary/20 text-secondary sm:size-8">
                    <Icon name={point.icon as IconName} size={14} />
                  </span>
                  <span className="truncate text-[0.7rem] font-bold text-white/90 sm:text-xs">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up min-w-0 [animation-delay:120ms]">
            <HeroPreviewStack listings={previewListings} />
          </div>
        </div>
      </div>

      <HeroFloatingSearch categories={categories} />
    </section>
  );
}

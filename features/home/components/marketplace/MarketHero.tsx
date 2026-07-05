import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import {
  getMarketHeroBackground,
  getMarketQuickSearches,
  getMarketTrustStats,
} from "@/services/content/homepage-marketplace.content";
import { MarketHeroSearch } from "./MarketHeroSearch";

type MarketHeroProps = {
  categories: Category[];
};

export async function MarketHero({ categories }: MarketHeroProps) {
  const [backgroundUrl, quickSearches, stats] = await Promise.all([
    getMarketHeroBackground(),
    getMarketQuickSearches(),
    getMarketTrustStats(),
  ]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <AppImage
          alt="أفق دبي — برج خليفة وأفق المدينة"
          className="object-cover object-center"
          fallback="emirates"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/82 to-[#fdfbf7]/96" />
        <div className="absolute inset-0 uae-hero-sand-wash opacity-70" />
        <div className="absolute inset-0 uae-geometric-texture opacity-[0.03]" />
      </div>

      <div className="relative z-10">
        <div className="app-container px-4 py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B8955F]/25 bg-white/90 px-4 py-1.5 text-xs font-bold text-[#8a7040] shadow-sm">
              <span className="inline-block h-3.5 w-5 overflow-hidden rounded-sm uae-flag-strip" />
              منصة إماراتية موثوقة
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl md:leading-[1.1]">
              بيع وشراء بثقة في الإمارات
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted md:text-lg">
              كل ما تحتاجه من سيارات، عقارات، إلكترونيات وخدمات في منصة إماراتية
              واحدة مع ضمان مالي يحمي المشتري والبائع.
            </p>

            <div className="mt-8 text-start md:mt-10">
              <MarketHeroSearch categories={categories} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {quickSearches.map((tag) => (
                <Link
                  key={tag.href}
                  className="rounded-full border border-[#B8955F]/20 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:border-[#B8955F]/35 hover:bg-[#B8955F]/8"
                  href={tag.href}
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm"
                >
                  <p className="text-xl font-bold text-ink md:text-2xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

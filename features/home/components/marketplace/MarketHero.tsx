import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import {
  getMarketHeroBackground,
  getMarketQuickSearches,
} from "@/services/content/homepage-marketplace.content";
import { MarketHeroSearch } from "./MarketHeroSearch";

type MarketHeroProps = {
  categories: Category[];
};

export async function MarketHero({ categories }: MarketHeroProps) {
  const [backgroundUrl, quickSearches] = await Promise.all([
    getMarketHeroBackground(),
    getMarketQuickSearches(),
  ]);

  return (
    <section className="market-hero relative overflow-hidden">
      <div className="market-hero-bg absolute inset-0">
        <AppImage
          alt="أفق الإمارات ومطار دولي"
          className="object-cover object-center"
          fallback="emirates"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
        <div className="market-hero-overlay absolute inset-0" />
        <div className="absolute inset-0 uae-hero-sand-wash opacity-70" />
        <div className="absolute inset-0 uae-geometric-texture opacity-[0.03]" />
      </div>

      <div className="relative z-10">
        <div className="app-container px-4 py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="market-hero-copy">
              <span className="market-hero-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm">
                <span className="inline-block h-3.5 w-5 overflow-hidden rounded-sm uae-flag-strip" />
                من الإمارات إلى العالم
              </span>

              <h1 className="market-hero-title mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
                بيع وشراء بثقة في الإمارات
              </h1>

              <p className="market-hero-lead mx-auto mt-4 max-w-2xl text-base leading-8 md:text-lg">
                كل ما تحتاجه من سيارات، عقارات، إلكترونيات وخدمات في منصة إماراتية
                واحدة مع ضمان مالي يحمي المشتري والبائع.
              </p>
            </div>

            <div className="mt-8 text-start md:mt-10">
              <MarketHeroSearch categories={categories} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {quickSearches.map((tag) => (
                <Link
                  key={tag.href}
                  className="market-hero-pill rounded-full px-3.5 py-1.5 text-xs font-bold transition"
                  href={tag.href}
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

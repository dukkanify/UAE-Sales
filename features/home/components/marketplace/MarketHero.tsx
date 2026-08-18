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
    <section className="market-hero">
      <div aria-hidden className="market-hero__scene">
        <div className="market-hero__mesh" />
        <span className="market-hero__orb market-hero__orb--gold" />
        <span className="market-hero__orb market-hero__orb--navy" />
        <span className="market-hero__orb market-hero__orb--mist" />
        <div className="market-hero__photo">
          <AppImage
            alt="أفق دبي وبرج خليفة"
            className="object-cover"
            fallback="emirates"
            fill
            priority
            sizes="100vw"
            src={backgroundUrl}
          />
        </div>
        <div className="market-hero__grid" />
        <div className="market-hero__shine" />
        <div className="market-hero__vignette" />
      </div>

      <div className="market-hero__content">
        <div className="app-container px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="market-hero-copy">
              <span className="market-hero-chip">
                <span className="market-hero-chip__flag uae-flag-strip" />
                من الإمارات إلى العالم
              </span>

              <h1 className="market-hero-title">
                بيع وشراء بثقة في{" "}
                <span className="market-hero-title__accent">الإمارات</span>
              </h1>

              <p className="market-hero-lead">
                كل ما تحتاجه من سيارات، عقارات، إلكترونيات وخدمات في منصة إماراتية
                واحدة مع ضمان مالي يحمي المشتري والبائع.
              </p>
            </div>

            <div className="mt-8 text-start md:mt-10">
              <MarketHeroSearch categories={categories} />
            </div>

            <div className="market-hero-pills">
              {quickSearches.map((tag) => (
                <Link
                  key={tag.href}
                  className="market-hero-pill"
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

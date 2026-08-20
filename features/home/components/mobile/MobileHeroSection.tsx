import { AppImage } from "@/shared/components/AppImage";
import { getMarketHeroBackground } from "@/services/content/homepage-marketplace.content";
import {
  MarketHeroBadge,
  MarketHeroCopy,
} from "@/features/home/components/marketplace/MarketHeroCopy";

export async function MobileHeroSection() {
  const backgroundUrl = await getMarketHeroBackground();

  return (
    <section className="mobile-home-hero">
      <div className="mobile-home-hero__media">
        <div className="mobile-home-hero__bg">
          <AppImage
            alt="أفق الإمارات ومطار دولي"
            className="object-cover"
            fallback="emirates"
            fill
            priority
            sizes="(max-width: 768px) calc(100vw - 2 * var(--mh-page-x, 1rem)), 480px"
            src={backgroundUrl}
          />
        </div>
        <div aria-hidden className="mobile-home-hero__media-overlay" />
        <MarketHeroBadge />
      </div>

      <div className="mobile-home-hero__content">
        <MarketHeroCopy variant="mobile" />
      </div>
    </section>
  );
}

import {
  MobileAppDownload,
  MobileCategoryGrid,
  MobileCategoryRail,
  MobileEmiratesSection,
  MobileFeaturedRail,
  MobileHeroBlock,
  MobileHomeHeader,
  MobileHomeShell,
  MobileNearbyRail,
  MobilePreviewStrip,
  MobilePromoBanner,
} from "@/features/home/components/mobile";
import { MarketEscrow } from "@/features/home/components/marketplace/MarketEscrow";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import type { Category, Listing } from "@/types";
import "./mobile-home.css";

type HomeSection = {
  categoryId: string;
  title: string;
  items: Listing[];
};

type MobileHomePageProps = {
  appPreviewListings: Listing[];
  categories: Category[];
  categoryById: (id: string) => string;
  featuredListings: Listing[];
  nearbyListings: Listing[];
  sectionListings: HomeSection[];
};

/** Isolated mobile homepage tree — keeps mobile-home.css off the desktop bundle. */
export function MobileHomePage({
  appPreviewListings,
  categories,
  categoryById,
  featuredListings,
  nearbyListings,
  sectionListings,
}: MobileHomePageProps) {
  return (
    <>
      <MobileHomeShell fullWidth>
        <MobileHomeHeader />
        <main className="mobile-home-main">
          <MobileHeroBlock categories={categories} />
          <MobileCategoryGrid categories={categories} />
          <MobilePromoBanner />
          <MobilePreviewStrip listings={featuredListings} />
          <MobileFeaturedRail listings={featuredListings} />
          <MobileNearbyRail listings={nearbyListings} />
          <MobileEmiratesSection />
          {sectionListings.map((section) => (
            <MobileCategoryRail
              key={section.categoryId}
              categorySlug={categoryById(section.categoryId)}
              listings={section.items}
              title={section.title}
            />
          ))}
          <MarketEscrow />
          <MobileAppDownload previewListings={appPreviewListings} />
        </main>
      </MobileHomeShell>
      <SiteFooter />
    </>
  );
}

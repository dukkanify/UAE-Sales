import {
  MarketCategoryGrid,
  MarketCategorySection,
  MarketEscrow,
  MarketFeatured,
  MarketHeader,
  MarketHero,
  MarketNearbySection,
  MarketPreviewStrip,
  MarketPromoBanner,
} from "@/features/home";
import { DeferredHomeBelowFold } from "@/features/home/components/marketplace/DeferredHomeBelowFold";
import { resolveAppPreviewListings } from "@/features/home/components/mobile/mobile-app-preview.config";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { getCategories } from "@/services/categories";
import { getHomeFeed } from "@/services/listings/home-feed";
import { getUaeEmiratesCards } from "@/features/home/shared/uae-emirates";
import { headers } from "next/headers";
import { userAgent } from "next/server";

export default async function Home() {
  const ua = userAgent({ headers: await headers() });
  const preferMobile =
    ua.device.type === "mobile" || ua.device.type === "tablet";

  const [categories, feed, emirates] = await Promise.all([
    getCategories(),
    getHomeFeed(),
    getUaeEmiratesCards(),
  ]);

  const categoryMeta = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const categoryById = (id: string) =>
    categories.find((c) => c.id === id)?.slug ?? id;

  const sectionListings = feed.sections.map((section) => ({
    categoryId: section.categoryId,
    categorySlug: categoryById(section.categoryId),
    description: section.description,
    eyebrow: section.eyebrow,
    listings: section.items,
    title: section.title,
    variant: section.variant,
  }));

  const appPreviewListings = resolveAppPreviewListings([
    ...feed.featured,
    ...feed.nearbySource,
  ]);

  if (preferMobile) {
    const { MobileHomePage } = await import(
      "@/features/home/components/mobile/MobileHomePage"
    );
    return (
      <MobileHomePage
        appPreviewListings={appPreviewListings}
        categories={categories}
        categoryById={categoryById}
        emirates={emirates}
        featuredListings={feed.featured}
        nearbyListings={feed.nearbySource}
        sectionListings={feed.sections}
      />
    );
  }

  const aboveFoldSections = sectionListings.slice(0, 2);
  const belowFoldSections = sectionListings.slice(2);

  return (
    <>
      <MarketHeader />
      <main>
        <MarketHero categories={categories} />
        <MarketCategoryGrid categories={categories} />
        <MarketPromoBanner />
        <MarketPreviewStrip categories={categoryMeta} listings={feed.preview} />
        <MarketFeatured categories={categoryMeta} listings={feed.featured} />
        <MarketNearbySection listings={feed.nearbySource} />
        {aboveFoldSections.map((section) => (
          <MarketCategorySection
            key={section.categoryId}
            categoryId={section.categoryId}
            categorySlug={section.categorySlug}
            description={section.description}
            eyebrow={section.eyebrow}
            listings={section.listings}
            title={section.title}
            variant={section.variant}
          />
        ))}
        <MarketEscrow />
        <DeferredHomeBelowFold
          appPreviewListings={appPreviewListings}
          emirates={emirates}
          sections={belowFoldSections}
        />
      </main>
      <SiteFooter />
    </>
  );
}

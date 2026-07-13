import {
  MarketAppDownload,
  MarketCategoryGrid,
  MarketCategorySection,
  MarketEmirates,
  MarketEscrow,
  MarketFeatured,
  MarketHeader,
  MarketHero,
  MarketNearbySection,
  MarketPreviewStrip,
  MarketPromoBanner,
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
} from "@/features/home";
import { resolveAppPreviewListings } from "@/features/home/components/mobile/mobile-app-preview.config";
import { mockHomeCategorySections } from "@/mock";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { getCategories } from "@/services/categories";
import { getFeaturedListings, getListings } from "@/services/listings";

export default async function Home() {
  const [categories, featuredListings, allListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
    getListings(),
  ]);

  const categoryMeta = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const categoryById = (id: string) =>
    categories.find((c) => c.id === id)?.slug ?? id;

  const sectionListings = mockHomeCategorySections.map((section) => ({
    ...section,
    items: allListings
      .filter((listing) => listing.categoryId === section.categoryId)
      .slice(0, 4),
  }));

  const appPreviewListings = resolveAppPreviewListings(allListings);

  return (
    <>
      <div className="lg:hidden">
        <MobileHomeShell>
          <MobileHomeHeader />
          <main className="mobile-home-main">
            <MobileHeroBlock categories={categories} />
            <MobileCategoryGrid categories={categories} />
            <MobilePromoBanner />
            <MobilePreviewStrip listings={featuredListings} />
            <MobileFeaturedRail listings={featuredListings} />
            <MobileNearbyRail listings={allListings} />
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
            <MobileAppDownload />
          </main>
        </MobileHomeShell>
      </div>

      <div className="hidden lg:contents">
        <MarketHeader />
        <main>
          <MarketHero categories={categories} />
          <MarketCategoryGrid categories={categories} />
          <MarketPromoBanner />
          <MarketPreviewStrip />
          <MarketFeatured categories={categoryMeta} listings={featuredListings} />
          <MarketNearbySection listings={allListings} />
          <MarketEmirates />
          {sectionListings.map((section) => (
            <MarketCategorySection
              key={section.categoryId}
              categoryId={section.categoryId}
              categorySlug={categoryById(section.categoryId)}
              description={section.description}
              eyebrow={section.eyebrow}
              listings={section.items}
              title={section.title}
              variant={section.variant}
            />
          ))}
          <MarketEscrow />
          <MarketAppDownload previewListings={appPreviewListings} />
        </main>
      </div>

      <SiteFooter />
    </>
  );
}

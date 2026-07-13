import {
  MarketCategoryGrid,
  MarketCategorySection,
  MarketEmirates,
  MarketEscrow,
  MarketFeatured,
  MarketHeader,
  MarketHero,
  MarketPreviewStrip,
  MarketSiteFooter,
  MobileAppDownload,
  MobileCategoryGrid,
  MobileEmiratesSection,
  MobileFeaturedRail,
  MobileHeroBlock,
  MobileHomeHeader,
  MobileHomeShell,
  MobileNearbyRail,
  MobilePromoBanner,
  MobileTrustSection,
} from "@/features/home";
import { mockHomeCategorySections } from "@/mock";
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

  return (
    <>
      <div className="lg:hidden">
        <MobileHomeShell>
          <MobileHomeHeader />
          <main className="mobile-home-main">
            <MobileHeroBlock categories={categories} />
            <MobileCategoryGrid categories={categories} />
            <MobilePromoBanner />
            <MobileFeaturedRail listings={featuredListings} />
            <MobileNearbyRail listings={allListings} />
            <MobileTrustSection />
            <MobileAppDownload />
            <MobileEmiratesSection />
          </main>
        </MobileHomeShell>
      </div>

      <div className="hidden lg:contents">
        <MarketHeader />
        <main>
          <MarketHero categories={categories} />
          <MarketCategoryGrid categories={categories} />
          <MarketPreviewStrip />
          <MarketFeatured categories={categoryMeta} listings={featuredListings} />
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
        </main>
        <MarketSiteFooter />
      </div>
    </>
  );
}

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
import { headers } from "next/headers";
import { userAgent } from "next/server";
import "@/features/home/components/mobile/mobile-home.css";

export default async function Home() {
  const ua = userAgent({ headers: await headers() });
  const preferMobile =
    ua.device.type === "mobile" || ua.device.type === "tablet";

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

  const featuredForHome = featuredListings.slice(0, 6);
  const appPreviewListings = resolveAppPreviewListings(allListings);

  if (preferMobile) {
    return (
      <>
        <MobileHomeShell fullWidth>
          <MobileHomeHeader />
          <main className="mobile-home-main">
            <MobileHeroBlock categories={categories} />
            <MobileCategoryGrid categories={categories} />
            <MobilePromoBanner />
            <MobilePreviewStrip listings={featuredForHome} />
            <MobileFeaturedRail listings={featuredForHome} />
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
            <MobileAppDownload previewListings={appPreviewListings} />
          </main>
        </MobileHomeShell>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <MarketHeader />
      <main>
        <MarketHero categories={categories} />
        <MarketCategoryGrid categories={categories} />
        <MarketPromoBanner />
        <MarketPreviewStrip
          categories={categoryMeta}
          listings={featuredForHome}
        />
        <MarketFeatured categories={categoryMeta} listings={featuredForHome} />
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
      <SiteFooter />
    </>
  );
}

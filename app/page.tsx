import {
  MarketCategorySection,
  MarketEmirates,
  MarketEscrow,
  MarketFeatured,
  MarketHeader,
  MarketHero,
  MarketPreviewStrip,
  MarketSiteFooter,
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
      <MarketHeader />
      <main>
        <MarketHero categories={categories} />
        <MarketPreviewStrip />
        <MarketFeatured categories={categoryMeta} listings={featuredListings} />
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
        <MarketEmirates />
      </main>
      <MarketSiteFooter />
    </>
  );
}

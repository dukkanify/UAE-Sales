import { MarketCategorySection } from "@/features/home/components/marketplace/MarketCategorySection";
import { MarketEmirates } from "@/features/home/components/marketplace/MarketEmirates";
import { MarketEscrow } from "@/features/home/components/marketplace/MarketEscrow";
import { MarketFeatured } from "@/features/home/components/marketplace/MarketFeatured";
import { MarketFooter } from "@/features/home/components/marketplace/MarketFooter";
import { MarketHeader } from "@/features/home/components/marketplace/MarketHeader";
import { MarketHero } from "@/features/home/components/marketplace/MarketHero";
import { MarketPreviewStrip } from "@/features/home/components/marketplace/MarketPreviewStrip";
import { getCategories } from "@/services/categories";
import {
  getFeaturedListings,
  getListings,
} from "@/services/listings";

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

  return (
    <>
      <MarketHeader />
      <main>
        <MarketHero categories={categories} />
        <MarketPreviewStrip />
        <MarketFeatured categories={categoryMeta} listings={featuredListings} />
        <MarketCategorySection
          categoryId="cars"
          categorySlug={categoryById("cars")}
          description="سيارات فاخرة ومستعملة من معارض موثوقة في دبي وأبوظبي."
          eyebrow="Cars"
          listings={allListings}
          title="سيارات في الإمارات"
          variant="sand"
        />
        <MarketCategorySection
          categoryId="real-estate"
          categorySlug={categoryById("real-estate")}
          description="شقق، فلل، ومكاتب للبيع والإيجار في أرقى مناطق الإمارات."
          eyebrow="Real Estate"
          listings={allListings}
          title="عقارات مميزة"
          variant="white"
        />
        <MarketCategorySection
          categoryId="electronics"
          categorySlug={categoryById("electronics")}
          description="إلكترونيات حديثة مع ضمان مالي وتوثيق للبائعين."
          eyebrow="Electronics"
          listings={allListings}
          title="إلكترونيات موثوقة"
          variant="sand"
        />
        <MarketEscrow />
        <MarketEmirates />
      </main>
      <MarketFooter />
    </>
  );
}

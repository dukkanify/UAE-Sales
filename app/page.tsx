import { Home3Categories } from "@/features/home/components/homepage3/Home3Categories";
import { Home3Escrow } from "@/features/home/components/homepage3/Home3Escrow";
import { Home3FeaturedListings } from "@/features/home/components/homepage3/Home3FeaturedListings";
import { Home3Footer } from "@/features/home/components/homepage3/Home3Footer";
import { Home3Hero } from "@/features/home/components/homepage3/Home3Hero";
import { Home3MarketSection } from "@/features/home/components/homepage3/Home3MarketSection";
import { Home3MobileApp } from "@/features/home/components/homepage3/Home3MobileApp";
import { Home3Partners } from "@/features/home/components/homepage3/Home3Partners";
import { Home3Testimonials } from "@/features/home/components/homepage3/Home3Testimonials";
import { Home3TrustBar } from "@/features/home/components/homepage3/Home3TrustBar";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
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

  return (
    <>
      <SiteHeader />
      <main>
        <Home3Hero categories={categories} listings={featuredListings} />
        <Home3TrustBar />
        <Home3Categories categories={categories} />
        <Home3FeaturedListings categories={categoryMeta} listings={featuredListings} />
        <Home3MarketSection
          categoryId="cars"
          description="سيارات فاخرة، SUVs، ومركبات موثوقة بتفاصيل واضحة وصور عالية الجودة."
          eyebrow="Luxury Cars"
          listings={allListings}
          title="سيارات تعكس أسلوب الإمارات"
        />
        <Home3MarketSection
          categoryId="real-estate"
          description="عقارات مختارة بتصوير راقٍ ومعلومات تساعدك على المقارنة بثقة."
          eyebrow="Real Estate"
          listings={allListings}
          title="منازل ومساحات تستحق المشاهدة"
        />
        <Home3MarketSection
          categoryId="electronics"
          description="أجهزة حديثة، لابتوبات، وإلكترونيات معروضة بطريقة واضحة وسريعة القراءة."
          eyebrow="Electronics"
          listings={allListings}
          title="تقنية يومية بمعايير ممتازة"
        />
        <Home3MarketSection
          categoryId="services"
          description="خدمات احترافية للأفراد والشركات، من التصوير إلى الصيانة والدعم."
          eyebrow="Services"
          listings={allListings}
          title="خدمات موثوقة للسوق المحلي"
        />
        <Home3Escrow />
        <Home3Testimonials />
        <Home3Partners />
        <Home3MobileApp />
      </main>
      <Home3Footer />
    </>
  );
}

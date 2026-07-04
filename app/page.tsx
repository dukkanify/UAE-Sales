import { AppDownload } from "@/features/home/components/AppDownload";
import { CategoriesGrid } from "@/features/home/components/CategoriesGrid";
import { EscrowSection } from "@/features/home/components/EscrowSection";
import { FeaturedListings } from "@/features/home/components/FeaturedListings";
import { HowItWorks } from "@/features/home/components/HowItWorks";
import { LatestListings } from "@/features/home/components/LatestListings";
import { PopularCities } from "@/features/home/components/PopularCities";
import { SearchHero } from "@/features/home/components/SearchHero";
import { StatsSection } from "@/features/home/components/StatsSection";
import { Testimonials } from "@/features/home/components/Testimonials";
import { WhyUaeSales } from "@/features/home/components/WhyUaeSales";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import {
  getFeaturedListings,
  getLatestListings,
} from "@/services/listings";

export default async function Home() {
  const [categories, featuredListings, latestListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
    getLatestListings(),
  ]);

  const categoryMeta = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <>
      <SiteHeader />
      <main>
        <SearchHero categories={categories} />
        <StatsSection />
        <CategoriesGrid categories={categories} />
        <FeaturedListings categories={categoryMeta} listings={featuredListings} />
        <LatestListings categories={categoryMeta} listings={latestListings} />
        <EscrowSection />
        <WhyUaeSales />
        <HowItWorks />
        <PopularCities />
        <Testimonials />
        <AppDownload />
      </main>
      <SiteFooter />
    </>
  );
}

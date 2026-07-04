import { AppDownload } from "@/components/home/AppDownload";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { EscrowSection } from "@/components/home/EscrowSection";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LatestListings } from "@/components/home/LatestListings";
import { PopularCities } from "@/components/home/PopularCities";
import { SearchHero } from "@/components/home/SearchHero";
import { StatsSection } from "@/components/home/StatsSection";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyUaeSales } from "@/components/home/WhyUaeSales";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import {
  getFeaturedListings,
  getLatestListings,
} from "@/services/listingsService";

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

import { Home3Categories } from "@/features/home/components/homepage3/Home3Categories";
import { Home3Emirates } from "@/features/home/components/homepage3/Home3Emirates";
import { Home3Escrow } from "@/features/home/components/homepage3/Home3Escrow";
import { Home3FeaturedListings } from "@/features/home/components/homepage3/Home3FeaturedListings";
import { Home3Footer } from "@/features/home/components/homepage3/Home3Footer";
import { Home3Hero } from "@/features/home/components/homepage3/Home3Hero";
import { Home3LatestPulse } from "@/features/home/components/homepage3/Home3LatestPulse";
import { Home3MobileApp } from "@/features/home/components/homepage3/Home3MobileApp";
import { Home3Testimonials } from "@/features/home/components/homepage3/Home3Testimonials";
import { Home3Why } from "@/features/home/components/homepage3/Home3Why";
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
        <Home3Hero categories={categories} listings={featuredListings} />
        <Home3Categories categories={categories} />
        <Home3FeaturedListings categories={categoryMeta} listings={featuredListings} />
        <Home3Why />
        <Home3Escrow />
        <Home3LatestPulse categories={categoryMeta} listings={latestListings} />
        <Home3Emirates />
        <Home3Testimonials />
        <Home3MobileApp />
      </main>
      <Home3Footer />
    </>
  );
}

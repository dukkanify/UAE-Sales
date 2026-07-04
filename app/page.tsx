import { FinalApp } from "@/features/home/components/final/FinalApp";
import { FinalCategories } from "@/features/home/components/final/FinalCategories";
import { FinalEmirates } from "@/features/home/components/final/FinalEmirates";
import { FinalEscrow } from "@/features/home/components/final/FinalEscrow";
import { FinalFeaturedListings } from "@/features/home/components/final/FinalFeaturedListings";
import { FinalFooter } from "@/features/home/components/final/FinalFooter";
import { FinalHeader } from "@/features/home/components/final/FinalHeader";
import { FinalHero } from "@/features/home/components/final/FinalHero";
import { FinalTestimonials } from "@/features/home/components/final/FinalTestimonials";
import { getCategories } from "@/services/categories";
import { getFeaturedListings } from "@/services/listings";

export default async function Home() {
  const [categories, featuredListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
  ]);

  const categoryMeta = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <>
      <FinalHeader />
      <main>
        <FinalHero categories={categories} />
        <FinalCategories categories={categories} />
        <FinalFeaturedListings
          categories={categoryMeta}
          listings={featuredListings}
        />
        <FinalEscrow />
        <FinalEmirates />
        <FinalTestimonials />
        <FinalApp />
      </main>
      <FinalFooter />
    </>
  );
}

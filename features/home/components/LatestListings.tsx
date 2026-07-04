import type { Listing } from "@/types";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { HomeListingCard } from "./HomeListingCard";

type LatestListingsProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function LatestListings({ categories, listings }: LatestListingsProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <section className="relative overflow-hidden section-padding bg-[linear-gradient(180deg,var(--color-background),#fff)]">
      <div className="pointer-events-none absolute start-10 top-8 h-52 w-52 rounded-full bg-accent/5 blur-3xl" />
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/search" size="sm" variant="secondary">
              عرض الكل
            </Button>
          }
          description="فرص جديدة من مختلف الإمارات، مرتبة بوضوح لتجد المناسب بسرعة."
          eyebrow="جديد"
          title="أحدث الإعلانات"
        />
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.slice(0, 8).map((listing) => (
            <HomeListingCard
              key={listing.id}
              categoryName={categoryMap.get(listing.categoryId)}
              listing={listing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

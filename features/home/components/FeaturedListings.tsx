import type { Listing } from "@/types";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { HomeListingCard } from "./HomeListingCard";

type FeaturedListingsProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function FeaturedListings({
  categories,
  listings,
}: FeaturedListingsProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <section className="relative overflow-hidden section-padding bg-surface">
      <div className="pointer-events-none absolute end-0 top-10 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/featured" size="sm" variant="primary">
              عرض المميز
            </Button>
          }
          description="إعلانات مختارة بعناية من بائعين موثوقين مع صور واضحة ومعلومات دقيقة."
          eyebrow="مميز"
          title="أفضل العروض"
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

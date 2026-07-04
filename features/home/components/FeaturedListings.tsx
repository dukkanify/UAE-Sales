import type { Listing } from "@/types";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";

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
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="gold" />

      <div className="app-container relative section-padding">
        <SectionHeader
          action={
            <Button href="/featured" size="sm" variant="accent">
              عرض المميز ←
            </Button>
          }
          description="إعلانات مختارة من بائعين موثوقين — جودة عالية وضمان مالي."
          eyebrow="مميز"
          title="أفضل العروض"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.slice(0, 8).map((listing) => (
            <ListingCard
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

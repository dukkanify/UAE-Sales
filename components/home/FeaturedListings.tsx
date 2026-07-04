import type { Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/featured" size="sm" variant="primary">
              عرض المميز
            </Button>
          }
          description="إعلانات مختارة من بائعين موثوقين."
          eyebrow="مميز"
          title="أفضل العروض"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

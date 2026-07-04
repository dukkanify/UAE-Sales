import type { Listing } from "@/types";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";

type LatestListingsProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function LatestListings({ categories, listings }: LatestListingsProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <section className="section-padding bg-surface-muted/50">
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/search" size="sm" variant="secondary">
              عرض الكل
            </Button>
          }
          description="أحدث الإعلانات المنشورة في السوق."
          eyebrow="جديد"
          title="أحدث الإعلانات"
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

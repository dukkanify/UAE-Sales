import type { Listing } from "@/types";
import { PremiumListingCard } from "@/features/listings/components/PremiumListingCard";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

type MarketFeaturedProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function MarketFeatured({ categories, listings }: MarketFeaturedProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const featured = listings.slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  return (
    <MarketSectionShell variant="white">
      <MarketSectionHeader
        actionHref="/featured"
        actionLabel="عرض جميع الإعلانات"
        description="إعلانات مختارة من سوقنا — صور حقيقية، أسعار واضحة، وضمان على كل معاملة."
        eyebrow="Featured"
        title="إعلانات مميزة"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((listing, index) => (
          <PremiumListingCard
            key={listing.id}
            categoryName={categoryMap.get(listing.categoryId)}
            listing={listing}
            priority={index < 3}
          />
        ))}
      </div>
    </MarketSectionShell>
  );
}

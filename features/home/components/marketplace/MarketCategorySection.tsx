import type { Listing } from "@/types";
import { MarketListingCard } from "./MarketListingCard";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

type MarketCategorySectionProps = {
  categoryId: string;
  categorySlug: string;
  description: string;
  eyebrow: string;
  listings: Listing[];
  title: string;
  variant?: "sand" | "white";
};

function listingHref(listing: Listing) {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

export function MarketCategorySection({
  categoryId,
  categorySlug,
  description,
  eyebrow,
  listings,
  title,
  variant = "sand",
}: MarketCategorySectionProps) {
  const items = listings.filter((l) => l.categoryId === categoryId).slice(0, 4);

  if (items.length === 0) {
    return null;
  }

  return (
    <MarketSectionShell variant={variant}>
      <MarketSectionHeader
        actionHref={`/categories/${categorySlug}`}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((listing) => (
          <MarketListingCard
            key={listing.id}
            listing={{
              city: listing.city,
              href: listingHref(listing),
              imageUrl: listing.imageUrl ?? "",
              price: listing.price,
              title: listing.title,
            }}
          />
        ))}
      </div>
    </MarketSectionShell>
  );
}

import type { Listing } from "@/types";
import { MobileFeaturedCard } from "./MobileFeaturedCard";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobileCategoryRailProps = {
  categorySlug: string;
  listings: Listing[];
  title: string;
};

export function MobileCategoryRail({
  categorySlug,
  listings,
  title,
}: MobileCategoryRailProps) {
  const items = listings.slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section aria-label={title} className="mobile-home-featured">
      <MobileSectionHeader
        actionHref={`/categories/${categorySlug}`}
        icon="grid"
        title={title}
      />
      <div className="mobile-home-featured__track mobile-home-scroll flex w-full max-w-full flex-nowrap overflow-x-auto overscroll-x-contain">
        {items.map((listing, index) => (
          <MobileFeaturedCard key={listing.id} listing={listing} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

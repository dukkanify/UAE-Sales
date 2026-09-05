import type { Listing } from "@/types";
import { DragScrollRow } from "@/shared/components/DragScrollRow";
import { MobileFeaturedCard } from "./MobileFeaturedCard";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobileFeaturedRailProps = {
  listings: Listing[];
};

export function MobileFeaturedRail({ listings }: MobileFeaturedRailProps) {
  const featured = listings.slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section aria-label="إعلانات مميزة" className="mobile-home-featured">
      <MobileSectionHeader actionHref="/featured" icon="star" title="إعلانات مميزة" />
      <DragScrollRow className="mobile-home-featured__track mobile-home-scroll flex w-full max-w-full flex-nowrap overflow-x-auto overscroll-x-contain">
        {featured.map((listing) => (
          <MobileFeaturedCard key={listing.id} listing={listing} />
        ))}
      </DragScrollRow>
    </section>
  );
}

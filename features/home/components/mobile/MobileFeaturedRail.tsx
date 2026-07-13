import type { Listing } from "@/types";
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
      <div className="mobile-home-featured__track mobile-home-scroll">
        {featured.map((listing, index) => (
          <MobileFeaturedCard key={listing.id} listing={listing} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

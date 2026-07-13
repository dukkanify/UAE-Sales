import type { Listing } from "@/types";
import { getNearbyListings } from "./mobile-home.config";
import { MobileNearbyCard } from "./MobileNearbyCard";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobileNearbyRailProps = {
  listings: Listing[];
};

export function MobileNearbyRail({ listings }: MobileNearbyRailProps) {
  const nearby = getNearbyListings(listings, 6);

  if (nearby.length === 0) return null;

  return (
    <section aria-label="القريبة منك" className="mobile-home-nearby">
      <MobileSectionHeader actionHref="/search" icon="map" title="القريبة منك" />
      <div className="mobile-home-nearby__track mobile-home-scroll flex w-full max-w-full flex-nowrap overflow-x-auto overscroll-x-contain">
        {nearby.map(({ distance, listing }, index) => (
          <MobileNearbyCard
            key={listing.id}
            distance={distance}
            listing={listing}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}

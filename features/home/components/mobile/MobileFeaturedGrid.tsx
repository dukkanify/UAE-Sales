import type { Listing } from "@/types";
import { MobileHomeListingCard } from "./MobileHomeListingCard";

type MobileFeaturedGridProps = {
  listings: Listing[];
};

export function MobileFeaturedGrid({ listings }: MobileFeaturedGridProps) {
  const featured = listings.slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section aria-label="إعلانات مميزة" className="px-4 pb-28 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-black text-ink">إعلانات مميزة</h2>
        <a className="text-xs font-bold text-secondary" href="/featured">
          عرض الكل
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {featured.map((listing, index) => (
          <MobileHomeListingCard key={listing.id} listing={listing} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}

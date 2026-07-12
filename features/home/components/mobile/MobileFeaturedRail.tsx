import type { Listing } from "@/types";
import { PremiumListingCard } from "@/features/listings/components/PremiumListingCard";
import { Icon } from "@/shared/ui/Icon";

type MobileFeaturedRailProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

export function MobileFeaturedRail({ categories, listings }: MobileFeaturedRailProps) {
  const categoryMap = new Map(categories.map((item) => [item.id, item.name]));
  const featured = listings.slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section aria-label="إعلانات مميزة" className="px-4 pb-28 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-black text-ink">
          <Icon className="text-secondary" name="star" size={16} />
          إعلانات مميزة
        </h2>
        <a className="text-xs font-bold text-secondary" href="/featured">
          عرض الكل
        </a>
      </div>

      <div className="mobile-home-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {featured.map((listing, index) => (
          <div key={listing.id} className="w-[17.5rem] shrink-0">
            <PremiumListingCard
              categoryName={categoryMap.get(listing.categoryId)}
              listing={listing}
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

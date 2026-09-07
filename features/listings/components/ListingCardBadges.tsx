import { Badge } from "@/shared/ui/Badge";
import {
  getListingCardBadges,
  type ListingCardBadge,
} from "@/features/listings/components/listing-card-badges";
import type { Listing } from "@/types";

type ListingCardBadgesProps = {
  className?: string;
  listing: Listing;
  /** Override resolved badges (optional). */
  badges?: ListingCardBadge[];
  /** Use static flow instead of absolute overlay (gallery/detail). */
  inline?: boolean;
};

export function ListingCardBadges({
  className = "",
  listing,
  badges,
  inline = false,
}: ListingCardBadgesProps) {
  const items = badges ?? getListingCardBadges(listing);
  if (items.length === 0) return null;

  const layoutClass = inline
    ? "relative flex flex-wrap gap-1.5"
    : "pointer-events-none absolute start-2.5 top-2.5 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1";

  return (
    <div className={`${layoutClass} ${className}`.trim()}>
      {items.map((badge) => (
        <Badge
          key={badge.key}
          className="!rounded-full !px-2 !py-0.5 !text-[0.65rem] !font-extrabold shadow-[0_2px_8px_rgb(15_23_42/18%)] backdrop-blur-[2px]"
          variant={badge.variant}
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}

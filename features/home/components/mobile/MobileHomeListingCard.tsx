import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Icon } from "@/shared/ui/Icon";
import {
  getListingHref,
  getListingImageUrl,
  getListingLocation,
} from "@/features/listings/components/listing-card.utils";

type MobileHomeListingCardProps = {
  listing: Listing;
  priority?: boolean;
};

export function MobileHomeListingCard({ listing, priority = false }: MobileHomeListingCardProps) {
  const href = getListingHref(listing);
  const imageUrl = getListingImageUrl(listing);
  const location = getListingLocation(listing);

  return (
    <article className="mobile-home-listing-card overflow-hidden rounded-[1rem] bg-surface shadow-[var(--shadow-sm)]">
      <Link className="block" href={href}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <AppImage
            alt={listing.title}
            className="object-cover transition duration-300 hover:scale-[1.02]"
            fallbackCategory={listing.categoryId}
            fill
            loading={priority ? undefined : "lazy"}
            priority={priority}
            sizes="50vw"
            src={imageUrl}
          />
          <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[0.65rem] font-bold text-ink shadow-[var(--shadow-xs)]">
            <Icon className="text-secondary" name="map" size={10} />
            {listing.emirate ?? listing.city}
          </span>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-ink">
            {listing.title}
          </h3>
          <div className="mt-2">
            <CurrencyAmount amount={listing.price} size="sm" />
          </div>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Icon name="map" size={11} />
            <span className="truncate">{location}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

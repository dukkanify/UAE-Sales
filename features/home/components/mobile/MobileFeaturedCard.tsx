"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { formatCurrencyDisplay } from "@/shared/utils/currency";
import { Icon } from "@/shared/ui/Icon";
import {
  formatPostedTime,
  formatViews,
  getListingHref,
  getListingImageUrl,
  getListingLocation,
} from "@/features/listings/components/listing-card.utils";

type MobileFeaturedCardProps = {
  imageFit?: "contain" | "cover";
  listing: Listing;
  priority?: boolean;
};

export const MobileFeaturedCard = memo(function MobileFeaturedCard({
  imageFit = "cover",
  listing,
  priority = false,
}: MobileFeaturedCardProps) {
  const href = getListingHref(listing);
  const imageUrl = getListingImageUrl(listing);
  const location = getListingLocation(listing);
  const photoCount = listing.images?.length ?? (listing.imageUrl ? 1 : 0);
  const isVerified =
    listing.verifiedSeller ??
    listing.seller.isVerified ??
    (listing.seller.rating ?? 0) >= 4.8;

  return (
    <article className="mobile-home-featured-card w-[var(--mh-card-width)] min-w-[15.5rem] max-w-[19rem] shrink-0 flex-none snap-start">
      <div className="mobile-home-featured-card__media">
        <Link className="absolute inset-0" href={href}>
          <span className="sr-only">{listing.title}</span>
          <AppImage
            alt={listing.title}
            className={`mobile-home-featured-card__image ${imageFit === "contain" ? "object-contain" : "object-cover"}`}
            fallbackCategory={listing.categoryId}
            fill
            loading={priority ? undefined : "lazy"}
            priority={priority}
            sizes="280px"
            src={imageUrl}
          />
        </Link>

        {listing.isFeatured ? (
          <span className="mobile-home-featured-card__badge-featured">مميز</span>
        ) : null}

        <div className="mobile-home-featured-card__actions">
          <FavoriteButton
            className="!min-h-8 !size-8 !rounded-full !border-0 !bg-white/95 !p-0 !shadow-[var(--mh-shadow-sm)]"
            iconOnly
            listing={listing}
          />
        </div>

        {photoCount > 0 ? (
          <span className="mobile-home-featured-card__photo-count">
            <Icon name="photo" size={12} />
            {photoCount}
          </span>
        ) : null}
      </div>

      <div className="mobile-home-featured-card__body">
        <p className="mobile-home-featured-card__price" dir="ltr">
          {formatCurrencyDisplay(listing.price, "ar-AE")}
        </p>

        <Link href={href}>
          <h3 className="mobile-home-featured-card__title">{listing.title}</h3>
        </Link>

        <p className="mobile-home-featured-card__meta">
          {location} • {formatPostedTime(listing.postedAt)}
        </p>

        <div className="mobile-home-featured-card__footer">
          {isVerified ? (
            <span className="mobile-home-featured-card__verified">
              <Icon name="check" size={12} />
              موثق
            </span>
          ) : (
            <span />
          )}
          <span className="mobile-home-featured-card__views">
            <Icon name="eye" size={12} />
            {formatViews(listing.views ?? 0)}
          </span>
        </div>
      </div>
    </article>
  );
});

"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ListingCardBadges } from "@/features/listings/components/ListingCardBadges";
import { isListingVerified } from "@/features/listings/components/listing-card-badges";
import { formatCurrencyDisplay } from "@/shared/utils/currency";
import { Icon } from "@/shared/ui/Icon";
import {
  formatPostedTime,
  formatViews,
  getListingHref,
  getListingImageUrl,
  getListingImages,
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
  const photoCount = getListingImages(listing).length;
  const isVerified = isListingVerified(listing);

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

        <ListingCardBadges className="!start-2 !top-2" listing={listing} />

        <div className="mobile-home-featured-card__actions">
          <FavoriteButton
            className="card-media-action !min-h-8 !size-8 !min-w-8 !rounded-full !p-0"
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

"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { ListingTitle } from "@/shared/i18n/ListingTitle";
import { listingTitle } from "@/shared/i18n/listing-copy";
import { useLocale } from "@/shared/i18n/useLocale";
import {
  getListingHref,
  getListingImageUrl,
} from "@/features/listings/components/listing-card.utils";

type MobileNearbyCardProps = {
  distance: string;
  listing: Listing;
  priority?: boolean;
};

export const MobileNearbyCard = memo(function MobileNearbyCard({
  distance,
  listing,
  priority = false,
}: MobileNearbyCardProps) {
  const href = getListingHref(listing);
  const imageUrl = getListingImageUrl(listing);
  const alt = listingTitle(listing, useLocale());

  return (
    <Link
      className="mobile-home-nearby-card shrink-0 flex-none snap-start"
      href={href}
    >
      <div className="mobile-home-nearby-card__media">
        {imageUrl ? (
          <AppImage
            alt={alt}
            className="object-cover"
            fill
            loading={priority ? undefined : "lazy"}
            priority={priority}
            sizes="140px"
            src={imageUrl}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-muted text-[0.65rem] font-semibold text-muted">
            لا توجد صورة
          </div>
        )}
        <span className="mobile-home-nearby-card__distance">{distance}</span>
      </div>
      <p className="mobile-home-nearby-card__title">
        <ListingTitle listing={listing} />
      </p>
    </Link>
  );
});

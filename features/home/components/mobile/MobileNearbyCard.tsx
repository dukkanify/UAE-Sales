"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
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

  return (
    <Link
      className="mobile-home-nearby-card shrink-0 flex-none snap-start"
      href={href}
    >
      <div className="mobile-home-nearby-card__media">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fallbackCategory={listing.categoryId}
          fill
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="140px"
          src={imageUrl}
        />
        <span className="mobile-home-nearby-card__distance">{distance}</span>
      </div>
      <p className="mobile-home-nearby-card__title">{listing.title}</p>
    </Link>
  );
});

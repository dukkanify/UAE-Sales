"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import {
  conditionLabels,
  getListingHref,
  getListingImageUrl,
  getListingLocation,
  listingPriceFormatter,
} from "./listing-card.utils";

export type PremiumListingCardProps = {
  categoryName?: string;
  layout?: "card" | "row";
  listing: Listing;
  priority?: boolean;
  showStatus?: boolean;
};

export const PremiumListingCard = memo(function PremiumListingCard({
  categoryName,
  layout = "card",
  listing,
  priority = false,
  showStatus = false,
}: PremiumListingCardProps) {
  const href = getListingHref(listing);
  const imageUrl = getListingImageUrl(listing);
  const location = getListingLocation(listing);
  const isVerified =
    listing.verifiedSeller ?? listing.seller.isVerified ?? listing.seller.rating >= 4.8;
  const showEscrow = listing.escrowAvailable === true;
  const showVerified = isVerified && !showEscrow;

  const badges = (
    <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-1.5">
      {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
      {showVerified ? <Badge variant="verified">موثق</Badge> : null}
      {showEscrow ? <Badge variant="escrow">ضمان مالي</Badge> : null}
    </div>
  );

  const saveButton = (
    <FavoriteButton
      ariaLabel={`حفظ ${listing.title}`}
      className="absolute end-3 top-3 z-20 min-h-8 border-0 bg-white/95 px-2.5 text-xs shadow-[var(--shadow-sm)]"
      label=""
    />
  );

  const imageArea = (
    <div
      className={`relative overflow-hidden bg-[#e8e4de] ${layout === "row" ? "h-full min-h-full w-full" : "aspect-[4/3]"}`}
    >
      {imageUrl ? (
        <Link className="absolute inset-0" href={href}>
          <span className="sr-only">{listing.title}</span>
          <AppImage
            alt={listing.title}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            priority={priority}
            sizes={
              layout === "row"
                ? "144px"
                : "(max-width: 768px) 80vw, (max-width: 1280px) 33vw, 25vw"
            }
            src={imageUrl}
          />
        </Link>
      ) : null}
      {badges}
      {saveButton}
    </div>
  );

  const bodyBlock = (
    <div
      className={`flex min-w-0 flex-1 flex-col ${layout === "card" ? "min-h-[9.5rem] p-4" : "justify-center p-4 md:p-5"}`}
    >
      {categoryName ? (
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#B8955F] sm:text-xs">
          {categoryName}
        </p>
      ) : null}
      <h3
        className={`line-clamp-2 font-bold leading-snug text-ink ${layout === "card" ? "mt-1 min-h-[2.75rem] text-sm sm:text-base" : "text-sm md:text-base"}`}
      >
        {listing.title}
      </h3>
      <p className="mt-1.5 truncate text-xs font-medium text-muted">
        {listing.seller.name}
        {listing.seller.rating ? (
          <>
            <span className="text-border"> · </span>
            <span className="inline-flex items-center gap-0.5">
              <Icon className="text-secondary" name="star" size={11} />
              {listing.seller.rating}
            </span>
          </>
        ) : null}
      </p>
      <div
        className={`mt-auto flex items-end justify-between gap-2 ${layout === "card" ? "pt-3" : "pt-2"}`}
      >
        <p className="text-base font-bold text-ink sm:text-lg">
          {listingPriceFormatter.format(listing.price)}{" "}
          <span className="text-xs font-semibold text-muted">د.إ</span>
        </p>
        <span className="inline-flex max-w-[48%] shrink-0 items-center gap-1 text-xs font-medium text-muted">
          <Icon name="map" size={12} />
          <span className="truncate">{location}</span>
        </span>
      </div>
      {layout === "card" ? (
        <div className="mt-2 flex items-center justify-between border-t border-border/80 pt-2.5 text-xs text-muted">
          <span>{conditionLabels[listing.condition]}</span>
          {showStatus && listing.status !== "active" ? (
            <span>{listing.status}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (layout === "row") {
    return (
      <article className="marketplace-card group flex overflow-hidden">
        <div className="relative w-28 shrink-0 sm:w-36">{imageArea}</div>
        <Link className="flex min-w-0 flex-1" href={href}>
          {bodyBlock}
        </Link>
      </article>
    );
  }

  return (
    <article className="marketplace-card group flex h-full flex-col">
      {imageArea}
      <Link className="flex flex-1 flex-col" href={href}>
        {bodyBlock}
      </Link>
    </article>
  );
});

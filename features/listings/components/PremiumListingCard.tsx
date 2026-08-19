"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { CardShareButton } from "@/shared/components/CardShareButton";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ListingTitle } from "@/shared/i18n/ListingTitle";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { ListingCardBadges } from "./ListingCardBadges";
import { isListingVerified } from "./listing-card-badges";
import {
  getListingHref,
  getListingImageUrl,
  getListingLocation,
  formatPostedTime,
  formatViews,
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
  const shareUrl = href;

  const isVerified = isListingVerified(listing);
  const showEscrow = showsEscrowProtection(listing);

  const imageArea = (
    <div
      className={`marketplace-card-media relative overflow-hidden ${layout === "row" ? "h-full min-h-full w-full" : "aspect-[4/3]"}`}
    >
      {imageUrl ? (
        <Link aria-hidden className="absolute inset-0" href={href} tabIndex={-1}>
          <AppImage
            alt=""
            className="marketplace-card-image"
            fallbackCategory={listing.categoryId}
            fill
            loading={priority ? undefined : "lazy"}
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

      <ListingCardBadges listing={listing} />

      <div className="absolute end-3 top-3 z-20 flex gap-1.5">
        <FavoriteButton
          className="card-media-action !min-h-8 !size-8 !min-w-8 !rounded-full !p-0"
          iconOnly
          listing={listing}
        />
        <CardShareButton
          className="card-media-action"
          title={listing.title}
          url={shareUrl}
        />
      </div>

      {showEscrow ? (
        <div className="absolute bottom-3 start-3 z-10">
          <Badge variant="escrow">ضمان مالي</Badge>
        </div>
      ) : null}
    </div>
  );

  const bodyBlock = (
    <div
      className={`flex min-w-0 flex-1 flex-col ${layout === "card" ? "min-h-[11rem] p-4" : "justify-center p-4 md:p-5"}`}
    >
      {categoryName ? (
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#B8955F] sm:text-xs">
          {categoryName}
        </p>
      ) : null}

      <Link className="min-w-0" href={href}>
        <h3
          className={`line-clamp-2 break-words font-bold leading-snug text-ink transition group-hover:text-secondary ${layout === "card" ? "mt-1 min-h-[2.75rem] text-sm sm:text-base" : "text-sm md:text-base"}`}
        >
          <ListingTitle listing={listing} />
        </h3>
      </Link>

      <div className="mt-2">
        <CurrencyAmount amount={listing.price} size="md" />
      </div>

      <div className="mt-2 flex items-center gap-2">
        {listing.seller.avatarUrl ? (
          <span className="relative size-7 shrink-0 overflow-hidden rounded-full ring-2 ring-surface">
            <AppImage
              alt={listing.seller.name}
              className="object-cover"
              fallback="avatar"
              fill
              sizes="28px"
              src={listing.seller.avatarUrl}
            />
          </span>
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary-soft text-[0.6rem] font-bold text-[#8a7040]">
            {listing.seller.name.slice(0, 2)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">
            {listing.seller.name}
            {isVerified ? (
              <Icon
                aria-label="بائع موثق"
                className="ms-1 inline text-success"
                name="check"
                size={12}
              />
            ) : null}
          </p>
          {listing.seller.rating ? (
            <p className="inline-flex items-center gap-0.5 text-[0.65rem] font-medium text-muted">
              <Icon className="text-secondary" name="star" size={10} />
              {listing.seller.rating}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted">
        <Icon name="map" size={12} />
        <span className="truncate">{location}</span>
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/80 pt-2.5 text-[0.65rem] font-medium text-muted sm:text-xs">
        <span className="inline-flex items-center gap-1">
          <Icon className="marketplace-card-meta-icon" name="clock" size={13} />
          {formatPostedTime(listing.postedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon className="marketplace-card-meta-icon" name="eye" size={13} />
          {formatViews(listing.views)} مشاهدة
        </span>
        {showStatus && listing.status !== "active" ? (
          <span>{listing.status}</span>
        ) : null}
      </div>
    </div>
  );

  if (layout === "row") {
    return (
      <LocalizedTree>
      <article className="marketplace-card group flex overflow-hidden">
        <div className="relative w-28 shrink-0 sm:w-36">{imageArea}</div>
        <div className="flex min-w-0 flex-1 flex-col">{bodyBlock}</div>
      </article>
      </LocalizedTree>
    );
  }

  return (
    <LocalizedTree>
    <article className="marketplace-card group flex h-full flex-col">
      {imageArea}
      {bodyBlock}
    </article>
    </LocalizedTree>
  );
});

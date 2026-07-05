"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { CardShareButton } from "@/shared/components/CardShareButton";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import {
  conditionBadgeVariant,
  conditionLabels,
  formatPostedTime,
  formatViews,
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
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${href}`;
    }
    return href;
  }, [href]);

  const isVerified =
    listing.verifiedSeller ?? listing.seller.isVerified ?? listing.seller.rating >= 4.8;
  const showEscrow = listing.escrowAvailable === true;

  const imageArea = (
    <div
      className={`marketplace-card-media relative overflow-hidden ${layout === "row" ? "h-full min-h-full w-full" : "aspect-[4/3]"}`}
    >
      {imageUrl ? (
        <Link className="absolute inset-0" href={href}>
          <span className="sr-only">{listing.title}</span>
          <AppImage
            alt={listing.title}
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

      <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-1.5">
        {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
        {listing.isPremium ? <Badge variant="premium">بريميوم</Badge> : null}
        <Badge variant={conditionBadgeVariant[listing.condition]}>
          {conditionLabels[listing.condition]}
        </Badge>
      </div>

      <div className="absolute end-3 top-3 z-20 flex gap-1.5">
        <FavoriteButton
          ariaLabel={`حفظ ${listing.title}`}
          className="!min-h-8 !size-8 !rounded-full !border-0 !bg-white/95 !p-0 !shadow-[var(--shadow-sm)]"
          label=""
        />
        <CardShareButton title={listing.title} url={shareUrl} />
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

      <Link href={href}>
        <h3
          className={`line-clamp-2 font-bold leading-snug text-ink transition group-hover:text-primary ${layout === "card" ? "mt-1 min-h-[2.75rem] text-sm sm:text-base" : "text-sm md:text-base"}`}
        >
          {listing.title}
        </h3>
      </Link>

      <p className="mt-2 text-lg font-bold text-ink sm:text-xl">
        {listingPriceFormatter.format(listing.price)}{" "}
        <span className="text-xs font-semibold text-muted">د.إ</span>
      </p>

      <div className="mt-2 flex items-center gap-2">
        {listing.seller.avatarUrl ? (
          <span className="relative size-7 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
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
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6rem] font-bold text-primary">
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
          <Icon name="clock" size={11} />
          {formatPostedTime(listing.postedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="eye" size={11} />
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
      <article className="marketplace-card group flex overflow-hidden">
        <div className="relative w-28 shrink-0 sm:w-36">{imageArea}</div>
        <div className="flex min-w-0 flex-1 flex-col">{bodyBlock}</div>
      </article>
    );
  }

  return (
    <article className="marketplace-card group flex h-full flex-col">
      {imageArea}
      {bodyBlock}
    </article>
  );
});

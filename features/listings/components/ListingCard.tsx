"use client";

import Link from "next/link";
import { memo } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingCardProps = {
  categoryName?: string;
  listing: Listing;
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export const ListingCard = memo(function ListingCard({
  categoryName,
  listing,
}: ListingCardProps) {
  const listingHref = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
  const isVerifiedSeller = listing.seller.rating >= 4.8;

  return (
    <Card
      className="premium-listing-card group h-full overflow-hidden rounded-[var(--radius-2xl)] p-0"
      interactive
      variant="elevated"
    >
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div className="relative aspect-[5/4] overflow-hidden bg-surface-muted">
            {listing.imageUrl ? (
              <AppImage
                alt={listing.title}
                className="object-cover transition duration-700 group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                src={listing.imageUrl}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <Icon name="photo" size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : <span />}
              {isVerifiedSeller ? <Badge variant="escrow">ضمان مالي</Badge> : null}
            </div>
          </div>
        </Link>

        <div className="absolute start-3 top-3 z-10">
          <FavoriteButton
            ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
            className="min-h-9 bg-white/92 px-2.5 text-xs shadow-[var(--shadow-sm)] backdrop-blur"
            label="مفضلة"
          />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-11 text-[0.95rem] font-bold leading-7 text-ink transition group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xl font-black text-accent">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3.5 text-xs font-semibold text-muted">
          <span>
            {categoryName ? `${categoryName} · ` : ""}
            {conditionLabels[listing.condition]}
          </span>
          <span className="inline-flex items-center gap-2">
            {isVerifiedSeller ? <Badge variant="verified">موثق</Badge> : null}
            <span className="inline-flex items-center gap-1">
              <Icon name="eye" size={12} />
              {listing.views.toLocaleString("ar-AE")}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
});

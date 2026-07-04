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
    <Card className="group h-full overflow-hidden rounded-[var(--radius-2xl)] p-0" interactive>
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            {listing.imageUrl ? (
              <AppImage
                alt={listing.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                src={listing.imageUrl}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <Icon name="photo" size={32} />
              </div>
            )}
            {listing.isFeatured ? (
              <div className="absolute start-3 top-3">
                <Badge variant="featured">مميز</Badge>
              </div>
            ) : null}
          </div>
        </Link>

        <div className="absolute end-3 top-3 z-10">
          <FavoriteButton
            ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
            className="min-h-8 bg-surface px-2 text-xs shadow-[var(--shadow-xs)]"
            label="مفضلة"
          />
        </div>
      </div>

      <div className="p-4">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-6 text-ink">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-medium text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span>
            {categoryName ? `${categoryName} · ` : ""}
            {conditionLabels[listing.condition]}
          </span>
          <span className="inline-flex items-center gap-2">
            {isVerifiedSeller ? <Badge variant="verified">موثق</Badge> : null}
          </span>
        </div>
      </div>
    </Card>
  );
});

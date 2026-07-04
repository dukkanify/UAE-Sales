"use client";

import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type HomeListingCardProps = {
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

export function HomeListingCard({ categoryName, listing }: HomeListingCardProps) {
  const listingHref = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;

  return (
    <article className="group overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            <AppImage
              alt={listing.title}
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              src={listing.imageUrl}
            />
          </div>
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex gap-2">
            {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
            <Badge variant="escrow">ضمان</Badge>
          </div>
          <FavoriteButton
            ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
            className="min-h-8 bg-white/95 px-2.5 text-xs shadow-[var(--shadow-xs)]"
            label="مفضلة"
          />
        </div>
      </div>

      <div className="p-4">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-11 text-[0.95rem] font-bold leading-7 text-ink">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xl font-black text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-medium text-muted">
          <span>
            {categoryName ? `${categoryName} · ` : ""}
            {conditionLabels[listing.condition]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="shield" size={12} />
            موثوق
          </span>
        </div>
      </div>
    </article>
  );
}

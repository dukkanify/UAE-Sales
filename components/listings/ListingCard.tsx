import Link from "next/link";
import type { Listing } from "@/types";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

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

export function ListingCard({ categoryName, listing }: ListingCardProps) {
  const listingHref = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
  const isVerifiedSeller = listing.seller.rating >= 4.8;

  return (
    <Card className="group h-full overflow-hidden p-0" interactive>
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            {listing.imageUrl ? (
              <div
                aria-label={listing.title}
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                role="img"
                style={{ backgroundImage: `url(${listing.imageUrl})` }}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <Icon name="photo" size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <FavoriteButton
                ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
                className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-surface/90 text-ink shadow-[var(--shadow-xs)] backdrop-blur transition hover:text-accent"
                label=""
              />
              <div className="flex flex-col items-end gap-1">
                {listing.isFeatured ? <Badge variant="gold">مميز</Badge> : null}
                {categoryName ? (
                  <Badge variant="muted">{categoryName}</Badge>
                ) : null}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex gap-1.5 p-3">
              <Badge variant="success">ضمان مالي</Badge>
              {isVerifiedSeller ? (
                <Badge variant="default">موثق</Badge>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-6 text-ink transition group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-black text-accent">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-medium text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs font-medium text-muted">
          <span>{conditionLabels[listing.condition]}</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="eye" size={12} />
            {listing.views.toLocaleString("ar-AE")}
          </span>
        </div>
      </div>
    </Card>
  );
}

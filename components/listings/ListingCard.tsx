import Link from "next/link";
import type { Listing } from "@/types";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type ListingCardProps = {
  categoryName?: string;
  listing: Listing;
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-100 to-orange-50",
  gold: "from-stone-100 to-amber-50",
  rose: "from-rose-100 to-pink-50",
  sky: "from-sky-100 to-blue-50",
  slate: "from-slate-100 to-gray-50",
};

const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function ListingCard({ categoryName, listing }: ListingCardProps) {
  const listingHref = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
  const isVerifiedSeller = listing.seller.rating >= 4.8;

  return (
    <Card className="group h-full overflow-hidden border-border/80 p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div
            className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${toneClasses[listing.imageTone]}`}
          >
            {listing.imageUrl ? (
              <div
                aria-label={listing.title}
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                role="img"
                style={{ backgroundImage: `url(${listing.imageUrl})` }}
              />
            ) : (
              <div className="grid h-full place-items-center">
                <div className="uae-flag-strip h-12 w-20 rounded-xl shadow-md" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <FavoriteButton
                ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
                className="inline-flex min-h-8 items-center justify-center rounded-lg bg-white/90 px-2.5 text-xs font-bold text-ink shadow-sm backdrop-blur transition hover:scale-105 hover:text-accent"
                label="♡"
              />
              <div className="flex flex-col items-end gap-1.5">
                {listing.isFeatured ? (
                  <Badge variant="gold">مميز</Badge>
                ) : null}
                {categoryName ? (
                  <Badge variant="muted">{categoryName}</Badge>
                ) : null}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3">
              <Badge variant="success">ضمان مالي</Badge>
              {isVerifiedSeller ? (
                <Badge variant="default">بائع موثق</Badge>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-11 text-sm font-black leading-6 text-ink transition group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-lg font-black text-accent">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-bold text-muted">د.إ</span>
          </p>
          <p className="text-xs font-bold text-muted">{listing.city}</p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs font-bold text-muted">
          <span>{conditionLabels[listing.condition]}</span>
          <span>{listing.views.toLocaleString("ar-AE")} مشاهدة</span>
        </div>
      </div>
    </Card>
  );
}

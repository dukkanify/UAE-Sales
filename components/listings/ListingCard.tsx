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
  amber: "from-amber-200 via-white to-orange-300",
  gold: "from-stone-200 via-white to-yellow-200",
  rose: "from-rose-200 via-white to-pink-300",
  sky: "from-sky-200 via-white to-blue-300",
  slate: "from-slate-200 via-white to-slate-400",
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

  return (
    <Card className="group h-full overflow-hidden rounded-2xl border-border bg-white transition duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
      <div className="relative">
        <Link href={listingHref}>
          <span className="sr-only">{listing.title}</span>
          <div
            className={`relative h-40 overflow-hidden bg-gradient-to-br ${toneClasses[listing.imageTone]} p-3`}
          >
            {listing.imageUrl ? (
              <div
                aria-label={listing.title}
                className="absolute inset-0 bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${listing.imageUrl})` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(17,24,39,0.16))]" />
            <div className="relative flex justify-end">
              {listing.isFeatured ? (
                <Badge className="border-white/40 bg-white/90 text-primary">
                  إعلان مميز
                </Badge>
              ) : (
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-primary shadow-sm">
                  {categoryName ?? "إعلان"}
                </span>
              )}
            </div>
            {!listing.imageUrl ? (
              <div className="relative grid h-full place-items-center pb-7">
                <div className="rounded-2xl border border-white/60 bg-white/35 p-3 backdrop-blur">
                  <div className="uae-flag-strip h-10 w-16 rounded-xl shadow-lg" />
                </div>
              </div>
            ) : null}
          </div>
        </Link>
        <FavoriteButton
          ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
          className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white text-lg shadow-sm transition hover:scale-105 hover:text-uae-red"
          label=""
        />
      </div>
      <div className="p-4">
        <Link href={listingHref}>
          <h3 className="line-clamp-2 min-h-12 text-sm font-black leading-6 text-ink transition group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-1 text-xs font-bold text-muted">
          {listing.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-lg font-black text-uae-red">
            {priceFormatter.format(listing.price)} د.إ
          </p>
          <p className="text-xs font-black text-muted">{listing.city}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs font-black">
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-primary">
            ضمان مالي
          </span>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-muted">
            {conditionLabels[listing.condition]}
          </span>
        </div>
      </div>
    </Card>
  );
}

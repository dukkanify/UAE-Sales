import Link from "next/link";
import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type ListingCardProps = {
  categoryName?: string;
  listing: Listing;
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-100 via-white to-orange-200",
  emerald: "from-emerald-100 via-white to-teal-200",
  rose: "from-rose-100 via-white to-pink-200",
  sky: "from-sky-100 via-white to-blue-200",
  slate: "from-slate-100 via-white to-slate-300",
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
  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
        <div
          className={`h-48 bg-gradient-to-br ${toneClasses[listing.imageTone]} p-4`}
        >
          <div className="flex justify-between gap-3">
            {listing.isFeatured ? (
              <Badge className="bg-white/85 text-primary">إعلان مميز</Badge>
            ) : (
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-primary">
                {categoryName ?? "إعلان"}
              </span>
            )}
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-black text-white">
              {conditionLabels[listing.condition]}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7 text-ink">
            {listing.title}
          </h3>
          <p className="mt-3 line-clamp-2 min-h-14 text-sm leading-7 text-muted">
            {listing.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xl font-black text-primary">
              {priceFormatter.format(listing.price)} د.إ
            </p>
            <p className="text-sm font-bold text-muted">{listing.city}</p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-bold text-muted">
            <span>{listing.seller.name}</span>
            <span>⭐ {listing.seller.rating}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

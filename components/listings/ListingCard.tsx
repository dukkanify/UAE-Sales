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
    <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
      <div className="relative">
        <Link href={`/listings/${listing.slug}`}>
          <span className="sr-only">{listing.title}</span>
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
            <div className="grid h-full place-items-center pb-8">
              <span className="text-5xl font-black text-ink/10">UAE</span>
            </div>
          </div>
        </Link>
        <button
          aria-label="إضافة إلى المفضلة"
          className="absolute bottom-4 left-4 grid size-11 place-items-center rounded-full bg-white text-lg shadow-[var(--shadow-soft)] transition hover:scale-105 hover:text-primary"
          type="button"
        >
          ♡
        </button>
      </div>
      <div className="p-5">
        <Link href={`/listings/${listing.slug}`}>
          <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7 text-ink transition group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-3 line-clamp-2 min-h-14 text-sm leading-7 text-muted">
          {listing.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xl font-black text-primary">
            {priceFormatter.format(listing.price)} د.إ
          </p>
          <p className="text-sm font-bold text-muted">{listing.city}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm font-bold text-muted">
          <span className="truncate">{listing.seller.name}</span>
          <span className="text-left">
            {listing.views.toLocaleString("ar-AE")} مشاهدة
          </span>
        </div>
      </div>
    </Card>
  );
}

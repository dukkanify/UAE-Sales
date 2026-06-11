import Link from "next/link";
import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type ListingCardProps = {
  categoryName?: string;
  listing: Listing;
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-200 via-white to-orange-300",
  emerald: "from-emerald-200 via-white to-teal-300",
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
  return (
    <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl">
      <div className="relative">
        <Link href={`/listings/${listing.slug}`}>
          <span className="sr-only">{listing.title}</span>
          <div
            className={`relative h-56 overflow-hidden bg-gradient-to-br ${toneClasses[listing.imageTone]} p-4`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.85),transparent_30%),linear-gradient(180deg,transparent,rgba(7,19,15,0.08))]" />
            <div className="uae-flag-strip absolute bottom-0 right-0 h-2 w-full" />
            <div className="relative flex justify-between gap-3">
              {listing.isFeatured ? (
                <Badge className="border-white/20 bg-night/85 text-white">
                  إعلان مميز
                </Badge>
              ) : (
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-primary shadow-sm">
                  {categoryName ?? "إعلان"}
                </span>
              )}
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-ink shadow-sm">
                {conditionLabels[listing.condition]}
              </span>
            </div>
            <div className="relative grid h-full place-items-center pb-8">
              <div className="rounded-[1.5rem] border border-white/50 bg-white/35 p-4 backdrop-blur">
                <div className="uae-flag-strip h-14 w-24 rounded-2xl shadow-lg" />
              </div>
            </div>
          </div>
        </Link>
        <button
          aria-label="إضافة إلى المفضلة"
          className="absolute bottom-4 left-4 grid size-12 place-items-center rounded-full bg-white text-xl shadow-[var(--shadow-soft)] transition hover:scale-105 hover:text-primary"
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
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3">
          <p className="text-xl font-black text-primary">
            {priceFormatter.format(listing.price)} د.إ
          </p>
          <p className="text-sm font-black text-muted">{listing.city}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm font-black text-muted">
          <span className="truncate">{listing.seller.name}</span>
          <span className="text-left">
            {listing.views.toLocaleString("ar-AE")} مشاهدة
          </span>
        </div>
      </div>
    </Card>
  );
}

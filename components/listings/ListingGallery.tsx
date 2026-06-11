import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";

type ListingGalleryProps = {
  listing: Listing;
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-100 via-white to-orange-200",
  emerald: "from-emerald-100 via-white to-teal-200",
  rose: "from-rose-100 via-white to-pink-200",
  sky: "from-sky-100 via-white to-blue-200",
  slate: "from-slate-100 via-white to-slate-300",
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const thumbnails = [1, 2, 3];

  return (
    <div className="grid gap-4">
      <div
        className={`min-h-[24rem] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-gradient-to-br ${toneClasses[listing.imageTone]} p-5 shadow-[var(--shadow-card)]`}
      >
        <div className="flex items-center justify-between gap-3">
          <Badge className="bg-white/85 text-primary">
            {listing.isFeatured ? "إعلان مميز" : "صورة الإعلان"}
          </Badge>
          <span className="rounded-full bg-ink/80 px-4 py-2 text-xs font-black text-white">
            {listing.city}
          </span>
        </div>
        <div className="grid min-h-[18rem] place-items-center">
          <div className="text-center">
            <p className="text-6xl font-black text-ink/15">UAE Sales</p>
            <p className="mt-3 text-sm font-bold text-muted">
              مساحة صور المنتج جاهزة للربط مع API الصور
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {thumbnails.map((thumbnail) => (
          <div
            key={thumbnail}
            className={`h-28 rounded-3xl border border-border bg-gradient-to-br ${toneClasses[listing.imageTone]} opacity-85`}
            aria-label={`صورة ${thumbnail} للإعلان`}
          />
        ))}
      </div>
    </div>
  );
}

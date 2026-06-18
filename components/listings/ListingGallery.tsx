import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";

type ListingGalleryProps = {
  listing: Listing;
};

const toneClasses: Record<Listing["imageTone"], string> = {
  amber: "from-amber-100 via-white to-orange-200",
  gold: "from-stone-100 via-white to-yellow-200",
  rose: "from-rose-100 via-white to-pink-200",
  sky: "from-sky-100 via-white to-blue-200",
  slate: "from-slate-100 via-white to-slate-300",
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const thumbnails = [1, 2, 3];

  return (
    <div className="grid gap-4">
      <div
        className={`relative min-h-[28rem] overflow-hidden rounded-[var(--radius-xl)] border border-white bg-gradient-to-br ${toneClasses[listing.imageTone]} p-5 shadow-[0_24px_70px_rgb(17_24_39/12%)]`}
      >
        <div className="uae-flag-strip absolute bottom-0 right-0 h-2 w-full" />
        <div className="absolute -left-20 -top-20 size-72 rounded-full bg-secondary/25 blur-3xl" />
        <div className="flex items-center justify-between gap-3">
          <Badge className="bg-white/85 text-primary shadow-sm">
            {listing.isFeatured ? "إعلان مميز" : "صورة الإعلان"}
          </Badge>
          <span className="rounded-full bg-ink/80 px-4 py-2 text-xs font-black text-white">
            {listing.city}
          </span>
        </div>
        <div className="relative grid min-h-[21rem] place-items-center">
          <div className="rounded-[2rem] border border-white/60 bg-white/35 p-10 text-center shadow-inner backdrop-blur">
            <div className="uae-flag-strip mx-auto h-16 w-28 rounded-2xl shadow-lg" />
            <p className="mt-6 text-5xl font-black text-ink/18">UAE Sales</p>
            <p className="mt-3 text-sm font-bold text-muted">
              معرض صور فاخر جاهز للربط مع API الصور
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {thumbnails.map((thumbnail) => (
          <div
            key={thumbnail}
            className={`h-28 rounded-3xl border border-white bg-gradient-to-br ${toneClasses[listing.imageTone]} opacity-90 shadow-sm`}
            aria-label={`صورة ${thumbnail} للإعلان`}
          />
        ))}
      </div>
    </div>
  );
}

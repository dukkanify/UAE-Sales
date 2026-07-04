import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";

type ListingGalleryProps = {
  listing: Listing;
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const thumbnails = listing.imageUrl
    ? [listing.imageUrl, listing.imageUrl, listing.imageUrl]
    : [];

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted shadow-[var(--shadow-lg)] lg:aspect-auto lg:min-h-[32rem]">
        {listing.imageUrl ? (
          <AppImage
            alt={listing.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={listing.imageUrl}
          />
        ) : (
          <div className="grid h-full min-h-[24rem] place-items-center bg-surface-muted text-muted">
            <Badge variant="muted">لا توجد صورة</Badge>
          </div>
        )}
        {listing.isFeatured ? (
          <div className="absolute start-4 top-4 z-10">
            <Badge variant="featured">إعلان مميز</Badge>
          </div>
        ) : null}
      </div>

      {thumbnails.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border"
            >
              <AppImage
                alt={`صورة ${index + 1} — ${listing.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 33vw, 20vw"
                src={url}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

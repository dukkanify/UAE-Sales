import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";

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
          <div
            aria-label={listing.title}
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${listing.imageUrl})` }}
          />
        ) : (
          <div className="grid h-full min-h-[24rem] place-items-center bg-surface-muted text-muted">
            <Badge variant="muted">لا توجد صورة</Badge>
          </div>
        )}
        {listing.isFeatured ? (
          <div className="absolute start-4 top-4">
            <Badge variant="featured">إعلان مميز</Badge>
          </div>
        ) : null}
      </div>

      {thumbnails.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((url, index) => (
            <div
              key={`${url}-${index}`}
              aria-label={`صورة ${index + 1}`}
              className="aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

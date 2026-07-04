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
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-muted shadow-[var(--shadow-card)] lg:aspect-auto lg:min-h-[28rem]">
        {listing.imageUrl ? (
          <div
            aria-label={listing.title}
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `url(${listing.imageUrl})` }}
          />
        ) : (
          <div className="grid h-full min-h-[20rem] place-items-center bg-surface-muted text-muted">
            <Badge variant="muted">لا توجد صورة</Badge>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {listing.isFeatured ? <Badge variant="gold">إعلان مميز</Badge> : <span />}
          <Badge variant="muted">{listing.city}</Badge>
        </div>
      </div>

      {thumbnails.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((url, index) => (
            <div
              key={`${url}-${index}`}
              aria-label={`صورة ${index + 1}`}
              className="aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-border bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

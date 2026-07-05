import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";

type ListingGalleryProps = {
  listing: Listing;
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const galleryImages =
    listing.images && listing.images.length > 0
      ? listing.images
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];

  const [primaryImage, ...thumbnailImages] = galleryImages;

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted shadow-[var(--shadow-lg)] lg:aspect-auto lg:min-h-[32rem]">
        {primaryImage ? (
          <AppImage
            alt={listing.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={primaryImage}
          />
        ) : (
          <div className="grid h-full min-h-[24rem] place-items-center bg-surface-muted text-muted">
            <Badge variant="muted">لا توجد صورة</Badge>
          </div>
        )}
        <div className="absolute start-4 top-4 z-10 flex flex-wrap gap-2">
          {listing.isFeatured ? <Badge variant="featured">إعلان مميز</Badge> : null}
          {listing.isPremium ? <Badge variant="premium">بريميوم</Badge> : null}
          {listing.verifiedSeller ? <Badge variant="verified">بائع موثق</Badge> : null}
        </div>
      </div>

      {thumbnailImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {thumbnailImages.slice(0, 7).map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-border"
            >
              <AppImage
                alt={`صورة ${index + 2} — ${listing.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 25vw, 15vw"
                src={url}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

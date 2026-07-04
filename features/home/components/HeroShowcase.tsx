import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import Image from "next/image";
import { getHeroShowcaseImage } from "@/services/content";

type HeroShowcaseProps = {
  listings: Listing[];
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function PreviewListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 320px"
          src={listing.imageUrl}
        />
        {listing.isFeatured ? (
          <div className="absolute start-3 top-3">
            <Badge variant="featured">مميز</Badge>
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink">{listing.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
          <p className="font-bold text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-medium text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export async function HeroShowcase({ listings }: HeroShowcaseProps) {
  const heroImage = await getHeroShowcaseImage();
  const [first, second] = listings;

  return (
    <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted shadow-[var(--shadow-soft)]">
        <Image
          alt="عقار فاخر في دبي"
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          src={heroImage}
        />
      </div>

      {first && second ? (
        <div className="grid gap-4">
          <PreviewListingCard listing={first} />
          <PreviewListingCard listing={second} />
        </div>
      ) : null}
    </div>
  );
}

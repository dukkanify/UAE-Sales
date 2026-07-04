import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type HeroMarketplaceCollageProps = {
  listings: Listing[];
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function pickListing(listings: Listing[], categoryId: string, fallbackIndex: number) {
  return (
    listings.find((listing) => listing.categoryId === categoryId) ??
    listings[fallbackIndex]
  );
}

function MiniListingCard({
  className = "",
  listing,
  size = "md",
}: {
  className?: string;
  listing: Listing;
  size?: "lg" | "md" | "sm";
}) {
  const isLarge = size === "lg";

  return (
    <article
      className={`overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[0_18px_55px_rgb(15_20_25/10)] ${className}`}
    >
      <div className={`relative overflow-hidden bg-surface-muted ${isLarge ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          priority={isLarge}
          sizes={isLarge ? "(max-width: 1024px) 90vw, 360px" : "(max-width: 1024px) 45vw, 220px"}
          src={listing.imageUrl}
        />
        <div className="absolute start-3 top-3">
          {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
        </div>
      </div>
      <div className={isLarge ? "p-4" : "p-3"}>
        <h3 className="line-clamp-1 text-sm font-bold text-ink">{listing.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-black text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-[0.65rem] font-medium text-muted">د.إ</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.7rem] font-medium text-muted">
            <Icon name="map" size={11} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export function HeroMarketplaceCollage({ listings }: HeroMarketplaceCollageProps) {
  const [realEstate, car, device] = [
    pickListing(listings, "real-estate", 2),
    pickListing(listings, "cars", 0),
    pickListing(listings, "mobiles", 1) ?? pickListing(listings, "electronics", 5),
  ];

  if (!realEstate || !car || !device) {
    return null;
  }

  return (
    <div className="relative min-w-0">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_35%_20%,rgb(201_169_98/18%),transparent_58%)]" />

      <div className="relative rounded-[2rem] border border-border bg-white/72 p-3 shadow-[0_28px_90px_rgb(15_20_25/10)] backdrop-blur-xl sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-black text-ink">معاينة من السوق</p>
            <p className="mt-0.5 text-xs font-medium text-muted">
              إعلانات حقيقية بتصنيفات متعددة
            </p>
          </div>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[0.68rem] font-bold text-primary">
            مباشر
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
          <MiniListingCard listing={realEstate} size="lg" />

          <div className="grid gap-4">
            <MiniListingCard listing={car} size="sm" />
            <MiniListingCard listing={device} size="sm" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-secondary/20 bg-secondary-soft/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-surface text-secondary shadow-[var(--shadow-xs)]">
              <Icon name="shield" size={19} />
            </span>
            <div>
              <p className="text-sm font-black text-ink">ضمان مالي ذكي</p>
              <p className="text-xs font-medium text-muted">
                يحمي حقوق المشتري والبائع حتى اكتمال الصفقة.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-primary shadow-[var(--shadow-xs)]">
            موثوق في الإمارات
          </span>
        </div>
      </div>
    </div>
  );
}

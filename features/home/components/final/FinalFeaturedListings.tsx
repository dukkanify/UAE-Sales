import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type FinalFeaturedListingsProps = {
  categories: { id: string; name: string }[];
  listings: Listing[];
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function listingHref(listing: Listing) {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

function Price({ amount, light = false }: { amount: number; light?: boolean }) {
  return (
    <p className={`text-lg font-bold ${light ? "text-white" : "text-ink"} md:text-xl`}>
      {priceFormatter.format(amount)}{" "}
      <span className={`text-xs font-semibold ${light ? "text-white/75" : "text-muted"}`}>
        د.إ
      </span>
    </p>
  );
}

function LargeListingCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <article className="group relative min-h-[28rem] overflow-hidden rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-card)] md:min-h-[32rem]">
      <Link className="absolute inset-0" href={listingHref(listing)}>
        <span className="sr-only">{listing.title}</span>
      </Link>
      <AppImage
        alt={listing.title}
        className="object-cover transition duration-700 group-hover:scale-[1.02]"
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        src={listing.imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute start-4 top-4 z-10 flex gap-2">
        <Badge variant="escrow">ضمان مالي</Badge>
        {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
      </div>
      <FavoriteButton
        ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
        className="absolute end-4 top-4 z-10 min-h-9 bg-white/95 px-3 text-xs shadow-[var(--shadow-xs)]"
        label="مفضلة"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
        {categoryName ? (
          <p className="text-xs font-semibold text-white/70">{categoryName}</p>
        ) : null}
        <h3 className="mt-1 max-w-lg text-2xl font-bold leading-tight text-white md:text-3xl">
          {listing.title}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-4">
          <Price amount={listing.price} light />
          <span className="inline-flex items-center gap-1 text-sm font-medium text-white/80">
            <Icon name="map" size={14} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

function SmallListingCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-white shadow-[var(--shadow-soft)] transition duration-300 hover:shadow-[var(--shadow-card)]">
      <div className="relative">
        <Link href={listingHref(listing)}>
          <span className="sr-only">{listing.title}</span>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            <AppImage
              alt={listing.title}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 768px) 100vw, 20vw"
              src={listing.imageUrl}
            />
          </div>
        </Link>
        <div className="absolute start-3 top-3">
          <Badge variant="escrow">ضمان</Badge>
        </div>
        <FavoriteButton
          ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
          className="absolute end-3 top-3 min-h-8 bg-white/95 px-2.5 text-xs shadow-[var(--shadow-xs)]"
          label="مفضلة"
        />
      </div>
      <div className="p-4">
        <Link href={listingHref(listing)}>
          <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-6 text-ink md:text-base">
            {listing.title}
          </h3>
        </Link>
        {categoryName ? (
          <p className="mt-1 text-xs font-medium text-muted">{categoryName}</p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Price amount={listing.price} />
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export function FinalFeaturedListings({
  categories,
  listings,
}: FinalFeaturedListingsProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const [primary, ...rest] = listings;

  if (!primary) {
    return null;
  }

  const smallListings = rest.slice(0, 4);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="app-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            إعلانات مميزة
          </h2>
          <Link
            className="text-sm font-bold text-[#B8955F] transition hover:text-[#a6844f]"
            href="/featured"
          >
            عرض جميع الإعلانات
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <LargeListingCard
            categoryName={categoryMap.get(primary.categoryId)}
            listing={primary}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {smallListings.slice(0, 2).map((listing) => (
              <SmallListingCard
                key={listing.id}
                categoryName={categoryMap.get(listing.categoryId)}
                listing={listing}
              />
            ))}
          </div>
        </div>

        {smallListings.length > 2 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {smallListings.slice(2, 4).map((listing) => (
              <SmallListingCard
                key={listing.id}
                categoryName={categoryMap.get(listing.categoryId)}
                listing={listing}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

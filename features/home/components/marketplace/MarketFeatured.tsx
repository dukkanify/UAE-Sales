import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { MarketListingCard } from "./MarketListingCard";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

type MarketFeaturedProps = {
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

function HeroFeatureCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <article className="group relative min-h-[22rem] overflow-hidden rounded-2xl bg-[#e8e4de] shadow-[0_12px_40px_rgb(15_20_25/10%)] md:min-h-[26rem]">
      <Link className="absolute inset-0" href={listingHref(listing)}>
        <span className="sr-only">{listing.title}</span>
      </Link>
      <AppImage
        alt={listing.title}
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        src={listing.imageUrl ?? ""}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute start-4 top-4 z-10 flex gap-2">
        <Badge variant="verified">موثق</Badge>
        <Badge variant="escrow">ضمان مالي</Badge>
      </div>
      <FavoriteButton
        ariaLabel={`إضافة ${listing.title} إلى المفضلة`}
        className="absolute end-4 top-4 z-10 min-h-9 bg-white/95 px-3 text-xs"
        label="مفضلة"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
        {categoryName ? (
          <p className="text-xs font-bold text-[#d4b87a]">{categoryName}</p>
        ) : null}
        <h3 className="mt-1 max-w-lg text-2xl font-bold leading-tight text-white md:text-3xl">
          {listing.title}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-2xl font-bold text-white">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-sm font-semibold text-white/75">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-white/85">
            <Icon name="map" size={14} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export function MarketFeatured({ categories, listings }: MarketFeaturedProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const [primary, ...rest] = listings;

  if (!primary) {
    return null;
  }

  return (
    <MarketSectionShell variant="white">
      <MarketSectionHeader
        actionHref="/featured"
        actionLabel="عرض جميع الإعلانات"
        description="إعلانات مختارة من السوق الإماراتي — صور حقيقية، أسعار واضحة، وضمان على كل معاملة."
        eyebrow="Featured"
        title="إعلانات مميزة"
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <HeroFeatureCard
          categoryName={categoryMap.get(primary.categoryId)}
          listing={primary}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 2).map((listing) => (
            <MarketListingCard
              key={listing.id}
              listing={{
                category: categoryMap.get(listing.categoryId),
                city: listing.city,
                href: listingHref(listing),
                imageUrl: listing.imageUrl ?? "",
                price: listing.price,
                title: listing.title,
              }}
              size="compact"
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(2, 5).map((listing) => (
          <MarketListingCard
            key={listing.id}
            listing={{
              category: categoryMap.get(listing.categoryId),
              city: listing.city,
              href: listingHref(listing),
              imageUrl: listing.imageUrl ?? "",
              price: listing.price,
              title: listing.title,
            }}
            size="compact"
          />
        ))}
      </div>
    </MarketSectionShell>
  );
}

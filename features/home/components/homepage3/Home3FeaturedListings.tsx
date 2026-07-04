import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Home3SectionHeader } from "./Home3SectionHeader";

type Home3FeaturedListingsProps = {
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

function Price({ listing }: { listing: Listing }) {
  return (
    <p className="text-xl font-black text-ink">
      {priceFormatter.format(listing.price)}{" "}
      <span className="text-xs font-semibold text-muted">د.إ</span>
    </p>
  );
}

function LargeFeatureCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <Link
      className="group relative min-h-[34rem] overflow-hidden rounded-[2.25rem] bg-surface shadow-[0_25px_80px_rgb(15_20_25/13%)]"
      href={listingHref(listing)}
    >
      <AppImage
        alt={listing.title}
        className="object-cover transition duration-700 group-hover:scale-105"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        src={listing.imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
      <div className="absolute start-5 top-5 flex gap-2">
        <Badge variant="featured">إعلان مختار</Badge>
        <Badge variant="escrow">ضمان مالي</Badge>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="text-xs font-bold text-white/72">{categoryName}</p>
        <h3 className="mt-2 max-w-lg text-3xl font-black leading-tight">
          {listing.title}
        </h3>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-2xl font-black">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-sm font-semibold text-white/75">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-white/80">
            <Icon name="map" size={14} />
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MediumCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <Link
      className="group grid overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] sm:grid-cols-[12rem_1fr]"
      href={listingHref(listing)}
    >
      <div className="relative min-h-52 overflow-hidden bg-surface-muted sm:min-h-full">
        <AppImage
          alt={listing.title}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, 240px"
          src={listing.imageUrl}
        />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="verified">موثق</Badge>
          <Badge variant="escrow">ضمان</Badge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-black leading-7 text-ink">
          {listing.title}
        </h3>
        <p className="mt-2 text-xs font-semibold text-muted">{categoryName}</p>
        <div className="mt-5 flex items-center justify-between">
          <Price listing={listing} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactCard({
  categoryName,
  listing,
}: {
  categoryName?: string;
  listing: Listing;
}) {
  return (
    <Link
      className="group overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      href={listingHref(listing)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          src={listing.imageUrl}
        />
        <div className="absolute start-3 top-3">
          <Badge variant="escrow">ضمان</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-sm font-black leading-6 text-ink">
          {listing.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-muted">{categoryName}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Price listing={listing} />
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Home3FeaturedListings({
  categories,
  listings,
}: Home3FeaturedListingsProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const [primary, secondary, tertiary, ...rest] = listings;

  if (!primary) {
    return null;
  }

  return (
    <section className="bg-white py-28">
      <div className="app-container">
        <Home3SectionHeader
          action={
            <Button href="/featured" size="sm" variant="primary">
              مشاهدة المختارات
            </Button>
          }
          description="تجربة عرض أقرب للمجلات الفاخرة: صور كبيرة، معلومات واضحة، وإحساس حقيقي بالسوق."
          eyebrow="Featured Listings"
          title="إعلانات مختارة بعناية"
        />

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <LargeFeatureCard
            categoryName={categoryMap.get(primary.categoryId)}
            listing={primary}
          />
          <div className="grid gap-6">
            {secondary ? (
              <MediumCard
                categoryName={categoryMap.get(secondary.categoryId)}
                listing={secondary}
              />
            ) : null}
            {tertiary ? (
              <MediumCard
                categoryName={categoryMap.get(tertiary.categoryId)}
                listing={tertiary}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.slice(0, 4).map((listing) => (
            <CompactCard
              key={listing.id}
              categoryName={categoryMap.get(listing.categoryId)}
              listing={listing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Home3SectionHeader } from "./Home3SectionHeader";

type Home3MarketSectionProps = {
  categoryId: string;
  description: string;
  eyebrow: string;
  listings: Listing[];
  title: string;
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function listingHref(listing: Listing) {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

function MarketCard({
  listing,
  variant = "default",
}: {
  listing: Listing;
  variant?: "default" | "wide";
}) {
  const isWide = variant === "wide";

  return (
    <Link
      className={`group overflow-hidden rounded-[2rem] border border-border bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${
        isWide ? "grid md:grid-cols-[1.05fr_0.95fr]" : ""
      }`}
      href={listingHref(listing)}
    >
      <div className={`relative overflow-hidden bg-surface-muted ${isWide ? "min-h-80" : "aspect-[4/3]"}`}>
        <AppImage
          alt={listing.title}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes={isWide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
          src={listing.imageUrl}
        />
        <div className="absolute start-4 top-4 flex gap-2">
          {listing.isFeatured ? <Badge variant="featured">مميز</Badge> : null}
          <Badge variant="escrow">ضمان</Badge>
        </div>
      </div>

      <div className={isWide ? "p-6" : "p-4"}>
        <h3 className={`${isWide ? "text-2xl leading-9" : "text-base leading-7"} line-clamp-2 font-black text-ink`}>
          {listing.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-7 text-muted">
          {listing.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xl font-black text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Home3MarketSection({
  categoryId,
  description,
  eyebrow,
  listings,
  title,
}: Home3MarketSectionProps) {
  const items = listings.filter((listing) => listing.categoryId === categoryId).slice(0, 5);
  const [primary, ...rest] = items;

  if (!primary) {
    return null;
  }

  return (
    <section className="bg-[#fffbf4] py-24 even:bg-white">
      <div className="app-container">
        <Home3SectionHeader
          action={
            <Button href={`/search?category=${categoryId}`} size="sm" variant="secondary">
              عرض المزيد
            </Button>
          }
          description={description}
          eyebrow={eyebrow}
          title={title}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <MarketCard listing={primary} variant="wide" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((listing) => (
              <MarketCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

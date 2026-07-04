import Link from "next/link";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { Home3SectionHeader } from "./Home3SectionHeader";

type Home3LatestPulseProps = {
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

export function Home3LatestPulse({ categories, listings }: Home3LatestPulseProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <section className="bg-[#fffbf4] py-28">
      <div className="app-container">
        <Home3SectionHeader
          action={
            <Button href="/search" size="sm" variant="secondary">
              كل الإعلانات
            </Button>
          }
          description="إعلانات جديدة من مختلف الإمارات، بتصميم سريع القراءة وسهل المقارنة."
          eyebrow="Latest"
          title="نبض السوق اليوم"
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {listings.slice(0, 6).map((listing, index) => (
            <Link
              key={listing.id}
              className={`group overflow-hidden rounded-[2rem] border border-border bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
              href={listingHref(listing)}
            >
              <div className={index === 0 ? "grid md:grid-cols-[1.1fr_0.9fr]" : ""}>
                <div className={`relative overflow-hidden bg-surface-muted ${index === 0 ? "min-h-80" : "aspect-[4/3]"}`}>
                  <AppImage
                    alt={listing.title}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 33vw"}
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
                  <p className="mt-2 text-xs font-semibold text-muted">
                    {categoryMap.get(listing.categoryId)}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <p className="text-xl font-black text-ink">
                      {priceFormatter.format(listing.price)}{" "}
                      <span className="text-xs font-semibold text-muted">د.إ</span>
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
                      <Icon name="map" size={12} />
                      {listing.city}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

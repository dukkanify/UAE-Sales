import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export type MarketListingCardData = {
  category?: string;
  city: string;
  href: string;
  imageUrl: string;
  price: number;
  title: string;
};

type MarketListingCardProps = {
  listing: MarketListingCardData;
  priority?: boolean;
  size?: "default" | "compact";
};

export function MarketListingCard({
  listing,
  priority = false,
  size = "default",
}: MarketListingCardProps) {
  const isCompact = size === "compact";

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_8px_32px_rgb(15_20_25/8%)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgb(15_20_25/12%)]"
      href={listing.href}
    >
      <div
        className={`relative overflow-hidden bg-[#e8e4de] ${isCompact ? "aspect-[4/3]" : "aspect-[5/4] sm:aspect-[4/3]"}`}
      >
        <AppImage
          alt={listing.title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          priority={priority}
          sizes="(max-width: 768px) 80vw, 25vw"
          src={listing.imageUrl}
        />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="verified">موثق</Badge>
          <Badge variant="escrow">ضمان مالي</Badge>
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${isCompact ? "p-3.5" : "p-4"}`}>
        {listing.category ? (
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#B8955F] sm:text-xs">
            {listing.category}
          </p>
        ) : null}
        <h3
          className={`mt-1 line-clamp-2 font-bold leading-snug text-ink ${isCompact ? "text-sm" : "text-base"}`}
        >
          {listing.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className={`font-bold text-ink ${isCompact ? "text-base" : "text-lg"}`}>
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
            <Icon name="map" size={12} />
            <span className="max-w-[7rem] truncate sm:max-w-none">{listing.city}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

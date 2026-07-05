import type { Listing } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingMapPlaceholderProps = {
  listing: Listing;
};

export function ListingMapPlaceholder({ listing }: ListingMapPlaceholderProps) {
  const locationLabel = listing.area
    ? `${listing.area}، ${listing.emirate ?? listing.city}`
    : listing.city;

  return (
    <Card className="mt-8 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-lg font-black text-ink">الموقع على الخريطة</h2>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
          <Icon name="map" size={14} />
          {locationLabel}
        </span>
      </div>
      <div className="relative grid min-h-[14rem] place-items-center bg-gradient-to-br from-[#e8eef5] via-[#f4f7fb] to-[#dfe8f2]">
        <div className="absolute inset-0 opacity-30 uae-geometric-texture" />
        <div className="relative z-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-white shadow-md">
            <Icon className="text-primary" name="map" size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">{locationLabel}</p>
          <p className="mt-1 text-xs text-muted">الإمارات العربية المتحدة</p>
        </div>
      </div>
    </Card>
  );
}

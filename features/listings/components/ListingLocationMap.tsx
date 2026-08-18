import type { Listing } from "@/types";
import {
  buildGoogleDirectionsUrl,
  buildOsmBrowseUrl,
  buildOsmEmbedUrl,
  resolveListingMapPoint,
} from "@/features/listings/lib/listing-map-location";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingLocationMapProps = {
  listing: Listing;
};

export function ListingLocationMap({ listing }: ListingLocationMapProps) {
  const point = resolveListingMapPoint({
    area: listing.area,
    emirate: listing.emirate,
    city: listing.city,
  });
  const embedUrl = buildOsmEmbedUrl(point);
  const directionsUrl = buildGoogleDirectionsUrl(point);
  const osmUrl = buildOsmBrowseUrl(point);

  return (
    <Card className="mt-8 overflow-hidden p-0 marketplace-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-ink">الموقع على الخريطة</h2>
          <p className="mt-1 text-xs font-medium text-muted">
            خريطة تفاعلية لموقع الإعلان
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          <Icon name="map" size={14} />
          {point.label}
        </span>
      </div>

      <div className="relative min-h-[16rem] overflow-hidden bg-[#e8eef5] sm:min-h-[18rem]">
        <iframe
          allowFullScreen
          className="block h-[16rem] w-full border-0 sm:h-[18rem]"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`خريطة موقع ${point.label}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
        <p className="text-xs font-medium text-muted">
          ©{" "}
          <a
            className="underline decoration-border underline-offset-2 hover:text-ink"
            href="https://www.openstreetmap.org/copyright"
            rel="noopener noreferrer"
            target="_blank"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-extrabold text-ink transition hover:border-[rgb(201_164_92_/_40%)] hover:bg-[rgb(248_243_234_/_80%)]"
            href={osmUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon name="map" size={13} />
            فتح الخريطة
          </a>
          <a
            className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#c9a45c_0%,#a88642_100%)] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            الاتجاهات
          </a>
        </div>
      </div>
    </Card>
  );
}

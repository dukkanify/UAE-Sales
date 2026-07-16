import type { Listing } from "@/types";
import {
  buildGoogleMapsUrl,
  buildOsmBrowseUrl,
  buildOsmEmbedUrl,
  resolveDemoMapPoint,
} from "@/features/listings/lib/demo-map-location";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingMapPlaceholderProps = {
  listing: Listing;
};

export function ListingMapPlaceholder({ listing }: ListingMapPlaceholderProps) {
  const point = resolveDemoMapPoint({
    area: listing.area,
    emirate: listing.emirate,
    city: listing.city,
  });
  const embedUrl = buildOsmEmbedUrl(point);
  const googleMapsUrl = buildGoogleMapsUrl(point);
  const osmUrl = buildOsmBrowseUrl(point);

  return (
    <Card className="mt-8 overflow-hidden p-0 marketplace-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-ink">الموقع على الخريطة</h2>
            <span className="rounded-md bg-[rgb(201_164_92_/_12%)] px-2 py-0.5 text-[0.6875rem] font-extrabold text-[#a88642]">
              عرض تجريبي
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            خريطة تفاعلية تقريبية للمنطقة — للتجربة فقط
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
          <Icon name="map" size={14} />
          {point.label}
        </span>
      </div>

      <div className="relative min-h-[16rem] overflow-hidden bg-gradient-to-br from-[#e8eef5] via-[#f4f7fb] to-[#dfe8f2]">
        <div className="pointer-events-none absolute inset-0 opacity-20 uae-geometric-texture" />
        <iframe
          title={`خريطة موقع ${point.label}`}
          src={embedUrl}
          className="relative z-[1] block h-[16rem] w-full border-0 bg-[#eef2f7] sm:h-[18rem]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
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
            href={googleMapsUrl}
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

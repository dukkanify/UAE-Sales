import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { cities } from "@/shared/constants/locations";
import { emirateLandmarkLabels, type EmirateImageKey } from "@/shared/constants/image-fallbacks";
import { Icon } from "@/shared/ui/Icon";
import { getHomeCityHighlights } from "@/services/content";
import { getMarketEmirateImages } from "@/services/content/homepage-marketplace.content";
import { MobileSectionHeader } from "./MobileSectionHeader";

const EMIRATE_COUNT_ALIASES: Record<string, string> = {
  "ras-al-khaimah": "rak",
};

export async function MobileEmiratesSection() {
  const [images, highlights] = await Promise.all([
    getMarketEmirateImages(),
    getHomeCityHighlights(),
  ]);
  const countMap = new Map(highlights.map((item) => [item.cityId, item.listingCount]));

  return (
    <section aria-label="الإمارات الأكثر شعبية" className="mobile-home-emirates">
      <MobileSectionHeader title="الإمارات الأكثر شعبية" />
      <p className="mobile-home-emirates__desc">
        من دبي إلى الفجيرة — تصفح الإعلانات في إمارتك.
      </p>

      <div className="mobile-home-emirates__grid">
        {cities.map((city) => {
          const countKey = EMIRATE_COUNT_ALIASES[city.id] ?? city.id;
          const count = countMap.get(countKey) ?? 500;
          const landmark =
            emirateLandmarkLabels[city.id as EmirateImageKey] ?? city.name;

          return (
            <Link
              key={city.id}
              className="mobile-home-emirates__card group"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <AppImage
                alt={`${city.name} — ${landmark}`}
                className="mobile-home-emirates__image transition duration-500 group-active:scale-[1.02]"
                fallback="emirates"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                src={images[city.id]}
              />
              <span aria-hidden className="mobile-home-emirates__overlay" />
              <span className="mobile-home-emirates__content">
                <span className="mobile-home-emirates__count">
                  {count.toLocaleString("ar-AE")} إعلان
                </span>
                <span className="mobile-home-emirates__footer">
                  <span className="mobile-home-emirates__name">{city.name}</span>
                  <span className="mobile-home-emirates__arrow">
                    <Icon name="arrow-left" size={14} />
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

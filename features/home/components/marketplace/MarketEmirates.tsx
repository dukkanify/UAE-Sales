import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getHomeCityHighlights } from "@/services/content";
import { getMarketEmirateImages } from "@/services/content/homepage-marketplace.content";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

export async function MarketEmirates() {
  const [images, highlights] = await Promise.all([
    getMarketEmirateImages(),
    getHomeCityHighlights(),
  ]);
  const countMap = new Map(highlights.map((h) => [h.cityId, h.listingCount]));
  const aliases: Record<string, string> = { "ras-al-khaimah": "rak" };

  return (
    <MarketSectionShell variant="sand">
      <MarketSectionHeader
        description="من دبي إلى الفجيرة — تصفح الإعلانات في إمارتك."
        eyebrow="Emirates"
        title="الإمارات الأكثر شعبية"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const key = aliases[city.id] ?? city.id;
          const count = countMap.get(key) ?? 500;

          return (
            <Link
              key={city.id}
              className="group relative min-h-56 overflow-hidden rounded-2xl bg-[#e8e4de] shadow-[0_8px_28px_rgb(15_20_25/8%)] transition hover:shadow-[0_14px_40px_rgb(15_20_25/12%)]"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <AppImage
                alt={city.name}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                fill
                sizes="33vw"
                src={images[city.id]}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-semibold text-white/75">
                  {count.toLocaleString("ar-AE")} إعلان
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{city.name}</h3>
                  <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white">
                    <Icon name="arrow-left" size={15} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </MarketSectionShell>
  );
}

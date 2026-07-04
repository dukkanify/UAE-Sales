import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getHomeCityHighlights } from "@/services/content";
import { getFinalEmirateImages } from "@/services/content/homepage-final.content";
import { FinalSectionHeader } from "./FinalSectionHeader";

export async function FinalEmirates() {
  const [images, highlights] = await Promise.all([
    getFinalEmirateImages(),
    getHomeCityHighlights(),
  ]);
  const countMap = new Map(highlights.map((item) => [item.cityId, item.listingCount]));

  const cityIdAliases: Record<string, string> = {
    "ras-al-khaimah": "rak",
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="app-container">
        <FinalSectionHeader
          description="من دبي إلى الفجيرة — اكتشف الإعلانات في إمارتك."
          title="الإمارات الأكثر شعبية"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => {
            const highlightKey = cityIdAliases[city.id] ?? city.id;
            const listingCount = countMap.get(highlightKey) ?? countMap.get(city.id) ?? 500;

            return (
              <Link
                key={city.id}
                className="group relative min-h-64 overflow-hidden rounded-[var(--radius-2xl)] bg-surface-muted shadow-[var(--shadow-soft)] transition duration-300 hover:shadow-[var(--shadow-card)]"
                href={`/search?city=${encodeURIComponent(city.name)}`}
              >
                <AppImage
                  alt={`إعلانات ${city.name}`}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={images[city.id]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-medium text-white/70">
                    {listingCount.toLocaleString("ar-AE")} إعلان
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-white">{city.name}</h3>
                    <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-white/25">
                      <Icon name="arrow-left" size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

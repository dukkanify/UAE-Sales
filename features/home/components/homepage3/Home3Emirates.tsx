import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import {
  getHomeCityHighlights,
  getHomepage3Emirates,
} from "@/services/content";
import { Home3SectionHeader } from "./Home3SectionHeader";

export async function Home3Emirates() {
  const [visuals, highlights] = await Promise.all([
    getHomepage3Emirates(),
    getHomeCityHighlights(),
  ]);
  const visualMap = new Map(visuals.map((visual) => [visual.cityId, visual.imageUrl]));
  const countMap = new Map(highlights.map((item) => [item.cityId, item.listingCount]));

  return (
    <section className="bg-[#fffbf4] py-28">
      <div className="app-container">
        <Home3SectionHeader
          description="من أبراج دبي إلى ساحل الفجيرة، اكتشف السوق المحلي الأقرب إليك."
          eyebrow="Popular Emirates"
          title="الإمارات كوجهات للبيع والشراء"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="group relative min-h-72 overflow-hidden rounded-[2rem] bg-surface shadow-[0_18px_55px_rgb(15_20_25/10%)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_75px_rgb(15_20_25/14%)]"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <AppImage
                alt={`إعلانات ${city.name}`}
                className="object-cover transition duration-700 group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                src={visualMap.get(city.id)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/16 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold text-white/75">
                  {(countMap.get(city.id) ?? 500).toLocaleString("ar-AE")} إعلان
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-black">{city.name}</h3>
                  <span className="grid size-10 place-items-center rounded-full bg-white/18 text-white backdrop-blur">
                    <Icon name="arrow-left" size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

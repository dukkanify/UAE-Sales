import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { AppImage } from "@/shared/components/AppImage";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
import { Icon } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeCityHighlights } from "@/services/content";

const cityImages: Record<string, string> = {
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  "abu-dhabi":
    "https://images.unsplash.com/photo-1586728746335-850dffe35f2a?auto=format&fit=crop&w=800&q=80",
  sharjah:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  ajman:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  rak:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  fujairah:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
};

export async function PopularCities() {
  const highlights = await getHomeCityHighlights();
  const countByCityId = new Map(
    highlights.map((item) => [item.cityId, item.listingCount]),
  );

  return (
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="warm" />

      <div className="app-container relative section-padding">
        <SectionHeader
          align="center"
          description="تصفح الإعلانات في أهم مدن الدولة — من دبي إلى الفجيرة."
          eyebrow="المدن"
          title="أين تبحث؟"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="city-card-premium group relative overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <div className="relative h-36 overflow-hidden">
                <AppImage
                  alt={`إعلانات ${city.name}`}
                  className="object-cover transition duration-700 group-hover:scale-110"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={cityImages[city.id]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg font-black text-white">{city.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-white/80">
                    {(countByCityId.get(city.id) ?? 500).toLocaleString("ar-AE")} إعلان
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-bold text-muted">تصفح الإعلانات</span>
                <Icon className="text-secondary transition group-hover:translate-x-[-3px]" name="arrow-left" size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

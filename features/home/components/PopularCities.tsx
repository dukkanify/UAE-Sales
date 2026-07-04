import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeCityHighlights } from "@/services/content";

export async function PopularCities() {
  const highlights = await getHomeCityHighlights();
  const countByCityId = new Map(
    highlights.map((item) => [item.cityId, item.listingCount]),
  );

  return (
    <section className="relative overflow-hidden section-padding bg-[linear-gradient(180deg,var(--color-background),#fff)]">
      <div className="pointer-events-none absolute end-0 bottom-12 h-60 w-60 rounded-full bg-secondary/10 blur-3xl" />
      <div className="app-container">
        <SectionHeader
          align="center"
          description="تصفح الإعلانات في أهم مدن الدولة."
          eyebrow="المدن"
          title="أين تبحث؟"
        />

        <div className="relative mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="group rounded-[var(--radius-2xl)] border border-border bg-surface p-5 shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-[var(--shadow-md)]"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-surface-muted text-secondary">
                  <Icon name="map" size={18} />
                </span>
                <span className="text-sm font-semibold text-primary transition group-hover:translate-x-[-3px]">
                  تصفح ←
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-black text-ink">{city.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {(countByCityId.get(city.id) ?? 500).toLocaleString("ar-AE")} إعلان
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

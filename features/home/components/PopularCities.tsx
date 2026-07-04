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
    <section className="section-padding bg-surface-muted/50">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="تصفح الإعلانات في أهم مدن الدولة."
          eyebrow="المدن"
          title="أين تبحث؟"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="interactive-lift flex items-center gap-3 rounded-[var(--radius-2xl)] border border-border bg-surface p-4"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-surface-muted text-secondary">
                <Icon name="map" size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{city.name}</h3>
                <p className="text-xs font-medium text-muted">
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

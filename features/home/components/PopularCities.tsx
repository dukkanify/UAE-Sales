import Link from "next/link";
import { cities } from "@/shared/constants/locations";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeCityHighlights } from "@/services/content";

export async function PopularCities() {
  const highlights = await getHomeCityHighlights();
  const countByCityId = new Map(
    highlights.map((item) => [item.cityId, item.listingCount]),
  );

  return (
    <section className="section-padding bg-[var(--color-background)]">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="تصفح الإعلانات في أهم مدن الدولة."
          eyebrow="المدن"
          title="أين تبحث؟"
        />

        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="flex items-center justify-between rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-4 transition hover:border-secondary/30 hover:shadow-[var(--shadow-soft)]"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <div>
                <h3 className="text-sm font-semibold text-ink">{city.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {(countByCityId.get(city.id) ?? 500).toLocaleString("ar-AE")} إعلان
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">تصفح ←</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

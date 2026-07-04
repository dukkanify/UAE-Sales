import Link from "next/link";
import { cities } from "@/constants/locations";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const cityCounts: Record<string, number> = {
  دبي: 8420,
  أبوظبي: 5310,
  الشارقة: 3890,
  عجمان: 1240,
  "رأس الخيمة": 980,
  الفجيرة: 760,
};

export function PopularCities() {
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
              className="interactive-lift flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-surface-muted text-secondary">
                <Icon name="map" size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">{city.name}</h3>
                <p className="text-xs font-medium text-muted">
                  {(cityCounts[city.name] ?? 500).toLocaleString("ar-AE")} إعلان
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { cities } from "@/constants/locations";
import { SectionHeader } from "@/components/ui/SectionHeader";

const cityImages: Record<string, string> = {
  دبي: "🏙",
  أبوظبي: "🌆",
  الشارقة: "🏛",
  عجمان: "🌊",
  "رأس الخيمة": "⛰",
  الفجيرة: "🏖",
};

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
    <section className="section-padding bg-surface-muted/40">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="تصفح الإعلانات في أهم مدن وإمارات الدولة."
          eyebrow="المدن الشائعة"
          title="أين تبحث؟"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-[var(--shadow-md)]"
              href={`/search?city=${encodeURIComponent(city.name)}`}
            >
              <span className="grid size-14 place-items-center rounded-xl bg-surface-muted text-3xl transition group-hover:scale-105">
                {cityImages[city.name] ?? "📍"}
              </span>
              <div>
                <h3 className="text-base font-black text-ink">{city.name}</h3>
                <p className="mt-1 text-sm font-medium text-muted">
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

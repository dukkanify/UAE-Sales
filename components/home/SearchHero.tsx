import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type SearchHeroProps = {
  categories: Category[];
};

const trustPoints = [
  { icon: "🛡", label: "ضمان مالي 100%" },
  { icon: "✓", label: "بائعون موثقون" },
  { icon: "⚡", label: "دفع آمن وسريع" },
  { icon: "💬", label: "دعم 24/7" },
];

export function SearchHero({ categories }: SearchHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-10%,rgb(201_169_98/12),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgb(196_30_58/6),transparent_40%)]" />

      <div className="app-container relative section-padding">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6" variant="gold">
            السوق الإماراتي الفاخر 2026
          </Badge>

          <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            اشتري وبيع
            <span className="text-secondary"> بثقة </span>
            وأناقة
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-muted">
            منصة إعلانات مبوبة فاخرة في جميع إمارات الدولة — مع ضمان مالي يحمي
            كل معاملة.
          </p>

          <form
            action="/search"
            className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-lg)]"
          >
            <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-xl bg-surface-muted/50 px-4">
                <span aria-hidden className="text-muted">
                  ⌕
                </span>
                <input
                  aria-label="كلمة البحث"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/60"
                  name="q"
                  placeholder="ما الذي تبحث عنه؟"
                  type="search"
                />
              </label>
              <label className="flex min-h-12 items-center gap-2 rounded-xl bg-surface-muted/50 px-4">
                <select
                  aria-label="التصنيف"
                  className="w-full bg-transparent text-sm font-bold text-ink outline-none"
                  name="category"
                >
                  <option value="">كل التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-h-12 items-center gap-2 rounded-xl bg-surface-muted/50 px-4">
                <select
                  aria-label="الإمارة"
                  className="w-full bg-transparent text-sm font-bold text-ink outline-none"
                  name="city"
                >
                  <option value="">كل الإمارات</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
                type="submit"
              >
                بحث
              </button>
            </div>
            <input name="country" type="hidden" value={countries[0].name} />
          </form>

          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-6">
            {trustPoints.map((point) => (
              <span
                key={point.label}
                className="inline-flex items-center gap-2 text-sm font-bold text-muted"
              >
                <span aria-hidden>{point.icon}</span>
                {point.label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-secondary px-6 text-sm font-bold text-primary shadow-[var(--shadow-glow)] transition hover:-translate-y-px"
              href="/listings/new"
            >
              أضف إعلانك مجاناً
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-bold text-ink transition hover:bg-surface-muted"
              href="/categories"
            >
              تصفح التصنيفات
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

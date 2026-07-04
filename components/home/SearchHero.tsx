import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

type SearchHeroProps = {
  categories: Category[];
};

const trustPoints = [
  { icon: "shield" as const, label: "ضمان مالي" },
  { icon: "check" as const, label: "بائعون موثقون" },
  { icon: "wallet" as const, label: "دفع آمن" },
  { icon: "message" as const, label: "دعم 24/7" },
];

export function SearchHero({ categories }: SearchHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-20%,rgb(201_169_98/10),transparent_55%)]" />

      <div className="app-container relative section-padding pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-5" variant="gold">
            السوق الإماراتي الفاخر
          </Badge>

          <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
            اشتري وبيع
            <span className="text-secondary"> بثقة</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-8 text-muted">
            منصة إعلانات فاخرة في جميع إمارات الدولة — مع ضمان مالي يحمي كل
            معاملة.
          </p>

          <form
            action="/search"
            className="mx-auto mt-8 max-w-3xl rounded-[var(--radius-xl)] border border-border bg-surface p-2 shadow-[var(--shadow-lg)]"
          >
            <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-surface-muted px-3">
                <Icon className="shrink-0 text-muted" name="search" size={16} />
                <input
                  aria-label="كلمة البحث"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/60"
                  name="q"
                  placeholder="ما الذي تبحث عنه؟"
                  type="search"
                />
              </label>
              <label className="flex min-h-11 items-center rounded-[var(--radius-md)] bg-surface-muted px-3">
                <select
                  aria-label="التصنيف"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
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
              <label className="flex min-h-11 items-center rounded-[var(--radius-md)] bg-surface-muted px-3">
                <select
                  aria-label="الإمارة"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
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
              <Button type="submit" variant="primary">
                بحث
              </Button>
            </div>
            <input name="country" type="hidden" value={countries[0].name} />
          </form>

          <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-5">
            {trustPoints.map((point) => (
              <span
                key={point.label}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
              >
                <Icon className="text-secondary" name={point.icon} size={14} />
                {point.label}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/listings/new">
              <Button variant="accent">أضف إعلانك</Button>
            </Link>
            <Link href="/categories">
              <Button variant="secondary">التصنيفات</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

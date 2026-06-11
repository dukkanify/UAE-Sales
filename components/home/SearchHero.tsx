import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const stats = [
  { label: "إعلان نشط", value: "+18K" },
  { label: "إمارات مغطاة", value: "7" },
  { label: "عمليات بضمان", value: "+4.8K" },
];

type SearchHeroProps = {
  categories: Category[];
};

export function SearchHero({ categories }: SearchHeroProps) {
  return (
    <section className="app-container py-8 lg:py-12">
      <div className="luxury-gradient uae-pattern relative overflow-hidden rounded-[2.8rem] p-5 text-white shadow-[var(--shadow-glow)] md:p-8 lg:p-10">
        <div className="uae-flag-strip absolute left-0 top-0 h-full w-3 md:w-4" />
        <div className="absolute -left-24 top-12 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge className="border-white/15 bg-white/10 text-emerald-100">
              منصة إماراتية للبيع والشراء بضمان مالي
            </Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
              سوق الإمارات الجديد لإعلانات موثوقة وصفقات محمية.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-white/72">
              تجربة عربية بهوية إماراتية تجمع دبي، أبوظبي، الشارقة وباقي
              الإمارات في سوق واحد للسيارات والعقارات والموبايلات والخدمات.
            </p>

            <form
              action="/search"
              className="mt-8 grid gap-3 rounded-[2rem] border border-white/70 bg-white/90 p-3 text-ink shadow-2xl backdrop-blur-xl md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
            >
              <Input
                aria-label="ابحث عن إعلان"
                className="border-white/10 bg-white text-ink"
                label="كلمة البحث"
                name="q"
                placeholder="ابحث عن سيارة، هاتف، عقار..."
              />
              <Select
                aria-label="الدولة"
                className="border-white/10 bg-white text-ink"
                label="الدولة"
                name="country"
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.name,
                }))}
              />
              <Select
                aria-label="المدينة"
                className="border-white/10 bg-white text-ink"
                label="المدينة"
                name="city"
                options={[
                  { label: "كل المدن", value: "" },
                  ...cities.map((city) => ({
                    label: city.name,
                    value: city.name,
                  })),
                ]}
              />
              <Select
                aria-label="القسم"
                className="border-white/10 bg-white text-ink"
                label="القسم"
                name="category"
                options={[
                  { label: "كل الأقسام", value: "" },
                  ...categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  })),
                ]}
              />
              <Button className="self-end" type="submit">
                ابدأ البحث
              </Button>
            </form>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
                >
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-sm font-black text-white/58">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="premium-ring rounded-[2.2rem]">
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
                <div className="rounded-[1.8rem] bg-white p-5 text-ink shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary-soft px-4 py-2 text-xs font-black text-primary">
                      صفقة إماراتية محمية
                    </span>
                    <span className="text-sm font-black text-muted">
                      دبي مارينا
                    </span>
                  </div>
                  <div className="relative mt-5 h-56 overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_30%_20%,rgba(0,154,87,0.34),transparent_38%),linear-gradient(135deg,#e9fff7,#fff4d8)]">
                    <div className="uae-flag-strip absolute bottom-5 right-5 h-14 w-24 rounded-2xl shadow-lg" />
                  </div>
                  <div className="mt-5">
                    <h2 className="text-2xl font-black">
                      ساعة فاخرة في دبي بحالة ممتازة
                    </h2>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-muted">
                          المبلغ محجوز في الضمان
                        </p>
                        <p className="mt-1 text-3xl font-black text-primary">
                          2,800 د.إ
                        </p>
                      </div>
                      <span className="rounded-2xl bg-uae-black px-4 py-3 text-sm font-black text-white">
                        UAE Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-6 rounded-3xl border border-white/15 bg-night/80 p-4 text-white shadow-2xl backdrop-blur">
              <p className="text-xs font-black text-white/55">UAE Escrow</p>
              <p className="mt-1 text-xl font-black text-accent">محمي 100%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const stats = [
  { label: "إعلان نشط", value: "+18K" },
  { label: "مدينة مغطاة", value: "7" },
  { label: "عمليات آمنة", value: "+4.8K" },
];

type SearchHeroProps = {
  categories: Category[];
};

export function SearchHero({ categories }: SearchHeroProps) {
  return (
    <section className="app-container grid gap-10 py-12 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:py-20">
      <div>
        <Badge>سوق إماراتي بواجهة عربية واتجاه RTL</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-ink md:text-6xl">
          بيع واشتري في الإمارات بثقة مع حماية الدفع والضمان المالي.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-9 text-muted">
          ابدأ البحث عن السيارات، العقارات، الإلكترونيات، والأثاث في واجهة
          عربية سريعة ومجهزة للربط مع خدمات الدفع، المحفظة، والمحادثات.
        </p>

        <form
          action="/search"
          className="glass-panel mt-8 grid gap-4 rounded-[var(--radius-xl)] p-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
        >
          <Input
            aria-label="ابحث عن إعلان"
            label="كلمة البحث"
            name="q"
            placeholder="ابحث عن سيارة، هاتف، عقار..."
          />
          <Select
            aria-label="الدولة"
            label="الدولة"
            name="country"
            options={countries.map((country) => ({
              label: country.name,
              value: country.name,
            }))}
          />
          <Select
            aria-label="المدينة"
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
            بحث
          </Button>
        </form>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white/75 p-5">
              <p className="text-3xl font-black text-primary">{stat.value}</p>
              <p className="mt-1 text-sm font-bold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[2.5rem] bg-primary-soft blur-3xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white bg-ink p-6 text-white shadow-[var(--shadow-card)]">
          <div className="rounded-[1.5rem] bg-white/10 p-5">
            <p className="text-sm font-bold text-emerald-100">
              طلب شراء محمي بالضمان
            </p>
            <div className="mt-8 rounded-3xl bg-white p-5 text-ink">
              <div className="h-44 rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-amber-100" />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black">ساعة فاخرة بحالة ممتازة</h2>
                  <p className="mt-2 text-sm font-bold text-muted">دبي مارينا</p>
                </div>
                <p className="text-lg font-black text-primary">2,800 د.إ</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm font-bold">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>المبلغ محجوز بأمان</span>
                <span>✓</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>تحرير المبلغ بعد التأكيد</span>
                <span>✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

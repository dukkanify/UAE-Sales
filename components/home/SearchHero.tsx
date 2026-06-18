import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const stats = [
  { label: "مستخدم نشط", value: "+18K", icon: "🏷️" },
  { label: "عمليات ضمان", value: "+4.8K", icon: "🛡️" },
  { label: "ضمان مالي", value: "100%", icon: "✅" },
  { label: "مدن إماراتية", value: "7", icon: "🏙️" },
];

type SearchHeroProps = {
  categories: Category[];
};

export function SearchHero({ categories }: SearchHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ec_0%,#f8f7f4_78%,#ffffff_100%)]">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_18%_20%,rgba(185,28,28,0.10),transparent_22rem),radial-gradient(circle_at_78%_12%,rgba(200,164,93,0.22),transparent_30rem)]" />
      <div className="pointer-events-none absolute right-[8%] top-20 hidden opacity-20 lg:block">
        <div className="inline-flex items-end gap-4">
          <div className="h-40 w-10 rounded-t-full bg-primary" />
          <div className="h-72 w-12 rounded-t-full bg-primary" />
          <div className="h-52 w-16 rounded-t-full bg-primary" />
          <div className="h-44 w-20 rounded-t-full bg-primary" />
        </div>
        <div className="mt-3 h-10 w-96 rounded-full bg-primary/20 blur-md" />
      </div>

      <div className="app-container relative py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.28fr_1fr] lg:items-end">
          <div className="order-2 hidden lg:block">
            <div className="relative max-w-xs rounded-[2rem] border border-white bg-white p-4 shadow-[0_24px_80px_rgb(17_24_39/16%)]">
              <div className="mb-4 flex items-center justify-between gap-2 text-xs font-black">
                <span className="rounded-2xl bg-secondary-soft px-3 py-2 text-primary">
                  موثق إماراتياً
                </span>
                <span className="rounded-2xl bg-white px-3 py-2 text-muted shadow-sm">
                  في دبي
                </span>
              </div>
              <div className="relative h-44 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#f4dcb8,#fff8ed)]">
                <div className="uae-flag-strip absolute bottom-8 right-8 h-14 w-24 rounded-2xl shadow-xl" />
              </div>
              <h2 className="mt-5 text-xl font-black leading-8 text-primary">
                ساعة فاخرة في دبي بحالة ممتازة
              </h2>
              <div className="mt-5 grid gap-2 text-sm font-black text-muted">
                <div className="flex justify-between">
                  <span>الموقع</span>
                  <span className="text-primary">دبي، الإمارات</span>
                </div>
                <div className="flex justify-between">
                  <span>الضمان</span>
                  <span className="text-primary">ضمان مالي</span>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <span className="rounded-2xl bg-primary px-4 py-3 text-xs font-black text-white">
                  UAE Verified
                </span>
                <div className="text-left">
                  <p className="text-3xl font-black text-primary">2,800</p>
                  <p className="text-xs font-black text-muted">درهم إماراتي</p>
                </div>
              </div>
              <div className="absolute -bottom-5 left-6 rounded-3xl bg-primary p-4 text-white shadow-2xl">
                <p className="text-xs font-black text-white/60">UAE Escrow</p>
                <p className="mt-1 text-base font-black text-secondary">
                  محمي 100%
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 text-center lg:text-right">
            <Badge className="bg-white/85 text-primary shadow-sm">
              منصة إماراتية للبيع والشراء بضمان مالي
            </Badge>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black leading-[1.15] tracking-tight text-primary md:text-7xl lg:mx-0">
              اشتري وبيع بثقة وأمان
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-bold leading-8 text-primary/80 lg:mx-0">
              إعلانات مبوبة في جميع الإمارات مع ضمان مالي يحمي حقوقك
            </p>

            <form
              action="/search"
              className="mx-auto mt-9 grid max-w-5xl gap-3 rounded-[1.7rem] border border-white bg-white/95 p-4 text-ink shadow-[0_24px_70px_rgb(17_24_39/14%)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-[1.7fr_1fr_1fr_1fr_auto]"
            >
              <Input
                aria-label="ابحث عن إعلان"
                className="border-border bg-white text-ink"
                label="كلمة البحث"
                name="q"
                placeholder="ما الذي تبحث عنه؟"
              />
              <Select
                aria-label="الدولة"
                className="border-border bg-white text-ink"
                label="الدولة"
                name="country"
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.name,
                }))}
              />
              <Select
                aria-label="الإمارة / المدينة"
                className="border-border bg-white text-ink"
                label="الإمارة / المدينة"
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
                className="border-border bg-white text-ink"
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
              <Button
                className="self-end bg-secondary text-primary hover:bg-primary hover:text-white"
                type="submit"
              >
                بحث
              </Button>
            </form>

            <div className="mx-auto mt-5 grid max-w-5xl gap-2 rounded-[1.35rem] bg-white/70 px-4 py-3 text-sm font-black text-muted shadow-sm backdrop-blur md:grid-cols-4">
              <span>ضمان مالي 100%</span>
              <span>تحقق من الهوية</span>
              <span>دفع آمن</span>
              <span>دعم على مدار الساعة</span>
            </div>

            <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur"
                >
                  <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-secondary-soft text-xl">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-black text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-black text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

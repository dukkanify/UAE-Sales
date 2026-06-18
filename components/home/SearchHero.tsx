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
    <section className="app-container py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-[2.8rem] border border-white bg-[linear-gradient(135deg,#fff7ec_0%,#f8f0e5_48%,#fffdf8_100%)] p-5 shadow-[0_28px_90px_rgb(17_24_39/12%)] md:p-8 lg:p-10">
        <div className="uae-flag-strip absolute left-0 top-0 h-full w-2.5 md:w-3.5" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 size-96 rounded-full bg-uae-red/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 right-[35%] hidden opacity-[0.13] lg:block">
          <div className="h-64 w-12 rounded-t-full bg-primary" />
          <div className="-mt-24 mr-16 h-48 w-16 rounded-t-full bg-primary" />
          <div className="-mt-32 mr-40 h-56 w-20 rounded-t-full bg-primary" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto max-w-sm rounded-[2.2rem] border border-white bg-white/75 p-4 shadow-[0_24px_70px_rgb(17_24_39/14%)] backdrop-blur-xl">
              <div className="rounded-[1.7rem] bg-white p-4 shadow-inner">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="rounded-2xl bg-secondary-soft px-4 py-2 text-xs font-black text-primary">
                    موثق إماراتياً
                  </span>
                  <span className="rounded-2xl bg-primary px-4 py-2 text-xs font-black text-white">
                    ضمان مالي
                  </span>
                </div>
                <div className="relative h-48 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_28%_24%,rgba(200,164,93,0.45),transparent_34%),linear-gradient(135deg,#f3dec1,#fff8ed)]">
                  <div className="uae-flag-strip absolute bottom-8 right-8 h-16 w-28 rounded-2xl shadow-2xl" />
                </div>
                <h2 className="mt-6 text-2xl font-black leading-9 text-primary">
                  ساعة فاخرة في دبي بحالة ممتازة
                </h2>
                <div className="mt-5 grid gap-3 text-sm font-black text-muted">
                  <div className="flex items-center justify-between">
                    <span>الموقع</span>
                    <span className="text-primary">دبي، الإمارات</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الضمان</span>
                    <span className="text-primary">ضمان مالي 100%</span>
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <span className="rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white">
                    UAE Verified
                  </span>
                  <div className="text-left">
                    <p className="text-3xl font-black text-primary">2,800</p>
                    <p className="text-xs font-black text-muted">درهم إماراتي</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-8 rounded-3xl bg-primary p-4 text-white shadow-2xl">
                <p className="text-xs font-black text-white/60">UAE Escrow</p>
                <p className="mt-1 text-lg font-black text-secondary">
                  محمي 100%
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Badge className="bg-white/75 text-primary shadow-sm">
              منصة إماراتية للبيع والشراء بضمان مالي
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.12] tracking-tight text-primary md:text-7xl">
              سوق <span className="text-uae-red">الإمارات</span> الجديد
              <br />
              لإعلانات موثوقة
              <br />
              وصفقات <span className="text-secondary">محمية.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-9 text-muted">
              تجربة شراء وبيع آمنة وموثوقة بين الإماراتيين والمقيمين في دولة
              الإمارات. إعلانات حقيقية، تعامل آمن، ووسيط مالي يحمي حقوقك.
            </p>

            <form
              action="/search"
              className="mt-9 grid gap-3 rounded-[2rem] border border-white bg-white/95 p-3 text-ink shadow-[0_20px_60px_rgb(17_24_39/14%)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1fr_1fr_auto]"
            >
              <Input
                aria-label="ابحث عن إعلان"
                className="border-border bg-white text-ink"
                label="كلمة البحث"
                name="q"
                placeholder="ابحث عن سيارة، هاتف، عقار..."
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
              <Button className="self-end bg-uae-red hover:bg-primary" type="submit">
                ابدأ البحث
              </Button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur"
                >
                  <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-secondary-soft text-xl">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-black text-primary">{stat.value}</p>
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

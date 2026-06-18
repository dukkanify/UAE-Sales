import { cities, countries } from "@/constants/locations";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/Badge";

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
        <div className="mx-auto max-w-6xl text-center">
            <Badge className="bg-white/85 text-primary shadow-sm">
              منصة إماراتية للبيع والشراء بضمان مالي
            </Badge>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black leading-[1.15] tracking-tight text-primary md:text-7xl">
              اشتري وبيع بثقة وأمان
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-bold leading-8 text-primary/80">
              إعلانات مبوبة في جميع الإمارات مع ضمان مالي يحمي حقوقك
            </p>

            <form
              action="/search"
              className="mx-auto mt-9 max-w-5xl rounded-[1.7rem] border border-white bg-white/95 p-3 text-ink shadow-[0_24px_70px_rgb(17_24_39/14%)] backdrop-blur-xl"
            >
              <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-white px-4">
                  <span className="text-muted">⌕</span>
                  <input
                    aria-label="كلمة البحث"
                    className="w-full bg-transparent text-sm font-bold text-primary outline-none placeholder:text-muted"
                    name="q"
                    placeholder="ما الذي تبحث عنه؟"
                    type="search"
                  />
                </label>
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-white px-4">
                  <span>▦</span>
                  <select
                    aria-label="اختر التصنيف"
                    className="w-full bg-transparent text-sm font-black text-primary outline-none"
                    name="category"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-white px-4">
                  <span>⌖</span>
                  <select
                    aria-label="اختر الإمارة"
                    className="w-full bg-transparent text-sm font-black text-primary outline-none"
                    name="city"
                  >
                    <option value="">اختر الإمارة</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-white px-4">
                  <span>▾</span>
                  <select
                    aria-label="اختر المدينة"
                    className="w-full bg-transparent text-sm font-black text-primary outline-none"
                    name="country"
                  >
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-secondary px-6 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
                  type="submit"
                >
                  بحث <span>⌕</span>
                </button>
              </div>
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
    </section>
  );
}

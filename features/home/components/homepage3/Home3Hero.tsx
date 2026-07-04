import Image from "next/image";
import Link from "next/link";
import { cities, countries } from "@/shared/constants/locations";
import type { Category, Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import {
  getHomeQuickSearchTags,
  getHomeTrustPoints,
  getHomepage3HeroImages,
} from "@/services/content";

type Home3HeroProps = {
  categories: Category[];
  listings: Listing[];
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function selectListing(listings: Listing[], categoryId: string, fallbackIndex: number) {
  return (
    listings.find((listing) => listing.categoryId === categoryId) ??
    listings[fallbackIndex]
  );
}

function EditorialListing({
  className = "",
  listing,
  priority = false,
  tone = "light",
}: {
  className?: string;
  listing: Listing;
  priority?: boolean;
  tone?: "light" | "gold";
}) {
  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_70px_rgb(15_20_25/13%)] ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 80vw, 320px"
          src={listing.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute start-3 top-3">
          <Badge variant={tone === "gold" ? "featured" : "verified"}>
            {tone === "gold" ? "مختار" : "موثق"}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-black text-ink">{listing.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="font-black text-ink">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-xs font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
            <Icon name="map" size={12} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export async function Home3Hero({ categories, listings }: Home3HeroProps) {
  const [heroImages, trustPoints, quickTags] = await Promise.all([
    getHomepage3HeroImages(),
    getHomeTrustPoints(),
    getHomeQuickSearchTags(),
  ]);

  const villa = selectListing(listings, "real-estate", 2);
  const car = selectListing(listings, "cars", 0);
  const phone = selectListing(listings, "mobiles", 1);
  const watch = selectListing(listings, "fashion", 7);

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-[#fffbf4]">
      <div className="absolute inset-0">
        <Image
          alt=""
          className="object-cover object-center opacity-[0.18]"
          fill
          priority
          sizes="100vw"
          src={heroImages.skyline}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffbf4_0%,rgb(255_251_244/92%)_38%,rgb(255_251_244/72%)_64%,rgb(255_251_244/96%)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#fffbf4] to-transparent" />
      </div>
      <div className="absolute end-[18%] top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute start-8 bottom-16 h-56 w-56 rounded-full bg-accent/6 blur-3xl" />

      <div className="app-container relative grid min-h-[88vh] items-center gap-12 py-12 lg:grid-cols-[0.94fr_1.06fr] lg:py-16 lg:[direction:ltr]">
        <div className="order-2 min-w-0 lg:order-1 lg:[direction:rtl]">
          <div className="relative mx-auto max-w-xl lg:max-w-none">
            <div className="absolute -inset-6 rounded-[3rem] bg-white/40 blur-2xl" />
            <div className="relative grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              {villa ? (
                <EditorialListing
                  className="sm:row-span-2"
                  listing={villa}
                  priority
                  tone="gold"
                />
              ) : null}
              {car ? <EditorialListing listing={car} /> : null}
              {phone ? <EditorialListing listing={phone} /> : null}
            </div>
            {watch ? (
              <div className="relative mx-auto -mt-5 max-w-sm rounded-[1.5rem] border border-white/70 bg-white/95 p-3 shadow-[0_18px_55px_rgb(15_20_25/12%)] sm:-mt-8">
                <div className="flex items-center gap-3">
                  <div className="relative size-16 overflow-hidden rounded-[1rem] bg-surface-muted">
                    <AppImage
                      alt={watch.title}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={watch.imageUrl}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-black text-ink">
                      {watch.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted">
                      خدمة ضمان وفحص قبل الدفع
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-secondary-soft text-secondary">
                    <Icon name="shield" size={18} />
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="order-1 text-center lg:order-2 lg:text-start lg:[direction:rtl]">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-white/80 px-4 py-2 text-xs font-black text-primary shadow-[var(--shadow-xs)] backdrop-blur">
            <Icon className="text-secondary" name="star" size={14} />
            مستقبل الإعلانات المبوبة في الإمارات
          </div>

          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.5rem]">
            بيع وشراء بثقة في الإمارات
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-8 text-muted sm:text-lg lg:mx-0">
            منصة إماراتية ذكية للإعلانات المبوبة، تجمع بين سهولة البيع والشراء
            ونظام ضمان مالي يحمي حقوق المشتري والبائع.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button className="min-h-12 px-8" href="/listings/new" size="lg" variant="primary">
              أضف إعلانك
            </Button>
            <Button className="min-h-12 px-8" href="/search" size="lg" variant="secondary">
              استكشف الإعلانات
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
            {trustPoints.map((point) => (
              <div
                key={point.label}
                className="rounded-[1.25rem] border border-border bg-white/78 px-3 py-3 text-center shadow-[var(--shadow-xs)] backdrop-blur"
              >
                <Icon className="mx-auto text-secondary" name={point.icon} size={16} />
                <p className="mt-2 truncate text-xs font-black text-ink">{point.label}</p>
              </div>
            ))}
          </div>

          <form
            action="/search"
            className="mt-10 rounded-[2rem] border border-white bg-white/92 p-4 shadow-[0_30px_90px_rgb(15_20_25/13%)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-start">
                <p className="text-sm font-black text-ink">ابحث في سوق الإمارات</p>
                <p className="text-xs font-medium text-muted">
                  تجربة بحث مصممة لتصل لما تريد بسرعة.
                </p>
              </div>
              <span className="hidden rounded-full bg-secondary-soft px-3 py-1 text-xs font-black text-primary sm:inline-flex">
                +24,000 إعلان
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_auto]">
              <label className="flex min-h-[3.4rem] items-center gap-3 rounded-[1.25rem] border border-border bg-surface-muted/70 px-4">
                <Icon className="shrink-0 text-secondary" name="search" size={18} />
                <input
                  aria-label="ماذا تبحث عنه؟"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                  name="q"
                  placeholder="ماذا تبحث عنه؟"
                  type="search"
                />
              </label>
              <label className="flex min-h-[3.4rem] rounded-[1.25rem] border border-border bg-surface-muted/70 px-4">
                <select
                  aria-label="التصنيف"
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-ink outline-none"
                  name="category"
                >
                  <option value="">التصنيف</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-h-[3.4rem] rounded-[1.25rem] border border-border bg-surface-muted/70 px-4">
                <select
                  aria-label="الإمارة"
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-ink outline-none"
                  name="city"
                >
                  <option value="">الإمارة</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                className="min-h-[3.4rem] whitespace-nowrap rounded-[1.25rem] px-8"
                size="lg"
                type="submit"
                variant="accent"
              >
                بحث
              </Button>
            </div>
            <input name="country" type="hidden" value={countries[0].name} />
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
            {quickTags.map((tag) => (
              <Link
                key={tag.label}
                className="rounded-full border border-border bg-white/70 px-3 py-1.5 text-xs font-bold text-muted transition hover:border-secondary/40 hover:text-ink"
                href={tag.href}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

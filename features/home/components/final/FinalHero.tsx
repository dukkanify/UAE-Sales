import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getFinalHeroBackground, getFinalPopularSearches } from "@/services/content/homepage-final.content";
import { FinalHeroCollage } from "./FinalHeroCollage";
import { FinalHeroSearch } from "./FinalHeroSearch";

type FinalHeroProps = {
  categories: Category[];
};

const trustPoints = [
  { icon: "shield" as const, label: "ضمان مالي" },
  { icon: "check" as const, label: "مستخدمون موثوقون" },
  { icon: "wallet" as const, label: "دفع آمن" },
];

export async function FinalHero({ categories }: FinalHeroProps) {
  const [backgroundUrl, popularSearches] = await Promise.all([
    getFinalHeroBackground(),
    getFinalPopularSearches(),
  ]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <AppImage
          alt="أفق دبي"
          className="object-cover object-[center_30%]"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-white from-[32%] via-white/[0.97] to-white/50" />
        <div className="absolute inset-0 uae-hero-sand-wash opacity-80" />
        <div className="absolute inset-0 uae-geometric-texture opacity-[0.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7]/40 via-transparent to-white/15" />
      </div>

      <div className="relative z-10">
        <div className="app-container pb-[7.5rem] pt-7 md:pb-[8.5rem] md:pt-10">
          <div className="grid items-start gap-7 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="relative rounded-3xl bg-white/75 p-5 backdrop-blur-[2px] sm:bg-white/70 sm:p-6 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#B8955F]/25 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#8a7040]">
                <span className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] uae-flag-strip" />
                المنصة الإماراتية الأولى للإعلانات المبوبة
              </span>

              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                بيع وشراء بثقة في الإمارات
              </h1>

              <p className="mt-3 max-w-xl text-base leading-7 text-muted">
                منصة إماراتية ذكية تجمع السيارات، العقارات، الإلكترونيات والخدمات
                في مكان واحد مع ضمان مالي يحمي المشتري والبائع.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  className="uae-gold-gradient inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgb(184_149_95/32%)] transition hover:brightness-105"
                  href="/listings/new"
                >
                  <Icon name="plus" size={17} />
                  أضف إعلانك الآن
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#B8955F]/20 bg-white px-5 text-sm font-bold text-ink shadow-sm transition hover:border-[#B8955F]/35"
                  href="/search"
                >
                  <Icon name="search" size={17} />
                  تصفح الإعلانات
                </Link>
              </div>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {trustPoints.map((point) => (
                  <li
                    key={point.label}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
                  >
                    <span className="grid size-7 place-items-center rounded-full border border-[#B8955F]/12 bg-[#B8955F]/8 text-[#B8955F]">
                      <Icon name={point.icon} size={14} />
                    </span>
                    {point.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:block">
              <FinalHeroCollage />
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <FinalHeroCollage />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-[30%] sm:translate-y-[28%]">
          <div className="app-container">
            <FinalHeroSearch categories={categories} popularSearches={popularSearches} />
          </div>
        </div>
      </div>
    </section>
  );
}

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
          alt=""
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-white via-white/92 to-white/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="app-container pb-28 pt-10 md:pb-36 md:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#B8955F]/35 bg-[#B8955F]/8 px-4 py-1.5 text-xs font-bold text-[#8a7040]">
                المنصة الإماراتية الأولى للإعلانات المبوبة
              </span>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.85rem] lg:leading-[1.1]">
                بيع وشراء بثقة في الإمارات
              </h1>

              <p className="mt-4 max-w-xl text-base leading-8 text-muted">
                منصة إماراتية ذكية تجمع السيارات، العقارات، الإلكترونيات والخدمات
                في مكان واحد مع ضمان مالي يحمي المشتري والبائع.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#B8955F] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgb(184_149_95/35%)] transition hover:bg-[#a6844f]"
                  href="/listings/new"
                >
                  <Icon name="plus" size={18} />
                  أضف إعلانك الآن
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-white px-6 text-sm font-bold text-ink shadow-[0_4px_16px_rgb(15_20_25/6%)] transition hover:bg-surface-muted"
                  href="/search"
                >
                  <Icon name="search" size={18} />
                  تصفح الإعلانات
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {trustPoints.map((point) => (
                  <li
                    key={point.label}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-[#B8955F]/12 text-[#B8955F]">
                      <Icon name={point.icon} size={15} />
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

          <div className="mt-8 lg:hidden">
            <FinalHeroCollage />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-[42%]">
          <div className="app-container">
            <FinalHeroSearch categories={categories} popularSearches={popularSearches} />
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { getMarketHeroBackground } from "@/services/content/homepage-marketplace.content";
import { Icon } from "@/shared/ui/Icon";
import { MOBILE_TRUST_STATS } from "./mobile-home.config";
import { MobileHeroSearch } from "./MobileHeroSearch";

type MobileHeroSectionProps = {
  categories: Category[];
};

export async function MobileHeroSection({ categories }: MobileHeroSectionProps) {
  const backgroundUrl = await getMarketHeroBackground();

  return (
    <section className="mobile-home-hero relative overflow-hidden">
      <div className="absolute inset-0">
        <AppImage
          alt="أفق دبي — برج خليفة وأفق المدينة"
          className="object-cover object-center"
          fallback="emirates"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/88 to-[#fdfbf7]/96" />
        <div className="absolute inset-0 sooqna-hero-wash opacity-80" />
      </div>

      <div className="relative z-10 px-4 pb-4 pt-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-white/90 px-3 py-1 text-[0.65rem] font-bold text-[#8a7040] shadow-sm">
          <span className="inline-block h-3 w-4 overflow-hidden rounded-sm uae-flag-strip" />
          منصة إماراتية موثوقة
        </span>

        <h1 className="mt-4 text-[1.35rem] font-black leading-snug text-primary">
          بيع وشراء بثقة
          <span className="text-secondary"> في الإمارات</span>
        </h1>

        <p className="mt-2 max-w-sm text-sm leading-7 text-muted">
          كل ما تحتاجه من سيارات وعقارات وإلكترونيات في منصة واحدة مع ضمان مالي يحمي
          المشتري والبائع.
        </p>

        <div className="mt-4">
          <MobileHeroSearch categories={categories} />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {MOBILE_TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="mobile-home-stat rounded-xl border border-border/70 bg-white/90 px-2 py-2.5 text-center shadow-sm"
            >
              <Icon className="mx-auto text-secondary" name={stat.icon} size={16} />
              <p className="mt-1.5 text-sm font-black text-ink">{stat.value}</p>
              <p className="mt-0.5 text-[0.6rem] font-bold leading-tight text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

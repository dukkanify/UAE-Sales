import { AppImage } from "@/shared/components/AppImage";
import { getMarketHeroBackground } from "@/services/content/homepage-marketplace.content";

export async function MobileHeroSection() {
  const backgroundUrl = await getMarketHeroBackground();

  return (
    <section className="mobile-home-hero">
      <div className="mobile-home-hero__bg">
        <AppImage
          alt="أفق دبي — برج خليفة وأفق المدينة"
          aria-hidden
          className="object-cover object-center"
          fallback="emirates"
          fill
          priority
          sizes="100vw"
          src={backgroundUrl}
        />
      </div>
      <div aria-hidden className="mobile-home-hero__overlay" />

      <div className="mobile-home-hero__content">
        <span className="mobile-home-hero__badge">
          <span className="inline-block h-3 w-4 overflow-hidden rounded-sm uae-flag-strip" />
          منصة إماراتية موثوقة
        </span>

        <h1 className="mobile-home-hero__title">
          بيع وشراء بثقة في{" "}
          <span className="mobile-home-hero__title-accent">الإمارات</span>
        </h1>

        <p className="mobile-home-hero__desc">
          منصة إماراتية موثوقة لبيع وشراء السيارات والعقارات والإلكترونيات والوظائف
          والخدمات — بضمان مالي يحمي الطرفين.
        </p>
      </div>
    </section>
  );
}

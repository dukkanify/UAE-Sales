import { AppImage } from "@/shared/components/AppImage";
import { getMarketHeroBackground } from "@/services/content/homepage-marketplace.content";

export async function MobileHeroSection() {
  const backgroundUrl = await getMarketHeroBackground();

  return (
    <section className="mobile-home-hero">
      <div className="mobile-home-hero__media">
        <div className="mobile-home-hero__bg">
          <AppImage
            alt="أفق دبي — برج خليفة وأفق المدينة"
            className="object-cover"
            fallback="emirates"
            fill
            priority
            sizes="(max-width: 768px) calc(100vw - 2 * var(--mh-page-x, 1rem)), 480px"
            src={backgroundUrl}
          />
        </div>
        <div aria-hidden className="mobile-home-hero__media-overlay" />

        <span className="mobile-home-hero__badge">
          <span className="inline-block h-3 w-4 overflow-hidden rounded-sm uae-flag-strip" />
          منصة إماراتية موثوقة
        </span>
      </div>

      <div className="mobile-home-hero__content">
        <h1 className="mobile-home-hero__title">
          بيع وشراء بثقة في{" "}
          <span className="mobile-home-hero__title-accent">الإمارات</span>
        </h1>

        <p className="mobile-home-hero__desc">
          بيع وشراء السيارات والعقارات والإلكترونيات والوظائف والخدمات — بضمان مالي
          يحمي الطرفين.
        </p>
      </div>
    </section>
  );
}

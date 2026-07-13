import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { heroBackgroundUrl } from "@/shared/constants/image-fallbacks";
import { Icon } from "@/shared/ui/Icon";
import { MobileFeaturedCard } from "./MobileFeaturedCard";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobileAppDevicePreviewProps = {
  listing: Listing;
};

export function MobileAppDevicePreview({ listing }: MobileAppDevicePreviewProps) {
  return (
    <div className="mobile-home-app__device-preview" aria-hidden>
      <div className="mobile-home-app__device-preview-frame">
        <div className="mobile-home-app__device-preview-inner mobile-home-shell">
        <header className="mobile-home-header mobile-home-app__device-preview-header">
          <div className="mobile-home-header__bar">
            <span className="mobile-home-header__icon-btn">
              <Icon className="shrink-0 text-[var(--mh-primary)]" name="menu" size={22} />
            </span>

            <div className="mobile-home-header__logo">
              <BrandMark size={30} variant="gold" />
              <span className="mobile-home-header__logo-text">
                <span className="mobile-home-header__logo-en">{BRAND.nameEn}</span>
                <span className="mobile-home-header__logo-ar">{BRAND.nameAr}</span>
              </span>
            </div>

            <div className="mobile-home-header__actions">
              <span className="mobile-home-header__icon-btn mobile-home-header__icon-btn--badge">
                <Icon name="bell" size={18} />
                <span className="mobile-home-header__badge">3</span>
              </span>

              <span className="mobile-home-header__location">
                <Icon className="mobile-home-header__location-icon" name="map" size={14} />
                <span className="mobile-home-header__location-value">دبي</span>
                <Icon className="mobile-home-header__chevron" name="chevron-left" size={12} />
              </span>
            </div>
          </div>
        </header>

        <div className="mobile-home-hero-block">
          <section className="mobile-home-hero">
            <div className="mobile-home-hero__bg">
              <AppImage
                alt=""
                aria-hidden
                className="object-cover object-center"
                fallback="emirates"
                fill
                priority
                sizes="390px"
                src={heroBackgroundUrl}
              />
            </div>
            <div aria-hidden className="mobile-home-hero__overlay" />

            <div className="mobile-home-hero__content">
              <span className="mobile-home-hero__badge">
                <span className="inline-block h-3 w-4 overflow-hidden rounded-sm uae-flag-strip" />
                منصة إماراتية موثوقة
              </span>

              <h2 className="mobile-home-hero__title">
                بيع وشراء بثقة في{" "}
                <span className="mobile-home-hero__title-accent">الإمارات</span>
              </h2>
            </div>
          </section>

          <section aria-hidden className="mobile-home-search-card">
            <div className="mobile-home-search-card__panel">
              <div className="mobile-home-search-card__input-row">
                <span className="mobile-home-search-card__input mobile-home-app__device-preview-placeholder">
                  ابحث عن أي شيء...
                </span>
                <Icon className="mobile-home-search-card__search-icon" name="search" size={18} />
              </div>

              <div className="mobile-home-search-card__filters">
                <span className="mobile-home-search-card__segment">
                  <span className="mobile-home-search-card__segment-label">التصنيف</span>
                  <span className="mobile-home-search-card__segment-control">
                    <Icon name="grid" size={11} />
                    <span className="mobile-home-app__device-preview-placeholder">الكل</span>
                  </span>
                </span>

                <span className="mobile-home-search-card__segment">
                  <span className="mobile-home-search-card__segment-label">الموقع</span>
                  <span className="mobile-home-search-card__segment-control">
                    <Icon name="map" size={11} />
                    <span className="mobile-home-app__device-preview-placeholder">دبي</span>
                  </span>
                </span>

                <span className="mobile-home-search-card__submit">
                  <Icon name="search" size={15} />
                  <span>بحث</span>
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="mobile-home-featured mobile-home-app__device-preview-featured">
          <MobileSectionHeader icon="star" title="إعلانات مميزة" />
          <div className="mobile-home-featured__track mobile-home-scroll flex w-full max-w-full flex-nowrap overflow-x-hidden overscroll-x-contain">
            <MobileFeaturedCard listing={listing} priority />
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

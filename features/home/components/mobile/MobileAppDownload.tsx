import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { heroBackgroundUrl, unsplashUrl } from "@/shared/constants/image-fallbacks";
import { Icon } from "@/shared/ui/Icon";
import { MOBILE_APP_LINKS } from "./mobile-home.config";

const APP_PREVIEW_IMAGES = {
  hero: heroBackgroundUrl,
  featured: unsplashUrl("photo-1618843479313-40f8afb4b4d8", 640),
  listingA: unsplashUrl("photo-1600607687939-ce8a6c25118c", 320),
  listingB: unsplashUrl("photo-1592899677977-9c10ca588bbd", 320),
};

function AppStoreBadgeIcon() {
  return (
    <svg aria-hidden className="mobile-home-app__store-icon" viewBox="0 0 24 24">
      <path
        d="M16.34 12.2c.02 2.14 1.88 2.86 1.9 2.87-.02.06-.29.98-.96 1.94-.58.83-1.18 1.65-2.12 1.67-.93.02-1.23-.55-2.3-.55-1.07 0-1.4.53-2.28.57-.92.04-1.62-.92-2.21-1.75-1.2-1.74-2.12-4.92-.87-7.07.62-1.08 1.73-1.76 2.94-1.78 1.02-.02 1.98.68 2.3.68.32 0 1.32-.84 2.22-.72.38.02 1.45.15 2.14 1.14-.05.03-1.28.75-1.26 2.24ZM13.9 4.4c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.57-.85 2.5.9.07 1.82-.46 2.38-1.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GooglePlayBadgeIcon() {
  return (
    <svg aria-hidden className="mobile-home-app__store-icon" viewBox="0 0 24 24">
      <path d="M4 3.5v17l10.2-8.5L4 3.5Z" fill="currentColor" opacity="0.9" />
      <path d="M15.8 12 6.5 19.8l11.2-6.5-1.9-1.3Z" fill="currentColor" opacity="0.75" />
      <path d="M6.5 4.2 15.8 12l1.9-1.1L17.7 4.4 6.5 4.2Z" fill="currentColor" opacity="0.55" />
      <path d="m17.7 19.6-1.9-1.1L15.8 12l1.9 1.1 2.8 1.6c.5.3.5 1 0 1.3l-2.8 1.6Z" fill="currentColor" />
    </svg>
  );
}

const APP_FEATURES = [
  { icon: "bell" as const, label: "إشعارات فورية" },
  { icon: "message" as const, label: "محادثات مباشرة" },
  { icon: "grid" as const, label: "إدارة إعلاناتك" },
] as const;

export function MobileAppDownload() {
  return (
    <section aria-label="تطبيق سوقنا" className="mobile-home-app">
      <div className="mobile-home-app__panel">
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--gold" />
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--navy" />

        <div className="mobile-home-app__layout">
          <div className="mobile-home-app__copy">
            <span className="mobile-home-app__eyebrow">
              <Icon name="phone" size={12} />
              حمّل التطبيق
            </span>

            <h2 className="mobile-home-app__title">
              تسوّق أسرع مع تطبيق{" "}
              <span className="mobile-home-app__title-brand">{BRAND.nameEn}</span>
            </h2>

            <p className="mobile-home-app__desc">
              كل مزايا سوقنا في جيبك — تصفّح، تواصل، وانشر إعلاناتك بسهولة.
            </p>

            <ul className="mobile-home-app__features">
              {APP_FEATURES.map((feature) => (
                <li key={feature.label} className="mobile-home-app__feature">
                  <Icon name={feature.icon} size={12} />
                  {feature.label}
                </li>
              ))}
            </ul>

            <div className="mobile-home-app__badges">
              <Link
                className="mobile-home-app__store-btn"
                href={MOBILE_APP_LINKS.appStore}
                rel="noopener noreferrer"
                target="_blank"
              >
                <AppStoreBadgeIcon />
                <span className="mobile-home-app__store-text">
                  <span className="mobile-home-app__store-label">حمّل من</span>
                  <span className="mobile-home-app__store-name">App Store</span>
                </span>
              </Link>
              <Link
                className="mobile-home-app__store-btn"
                href={MOBILE_APP_LINKS.playStore}
                rel="noopener noreferrer"
                target="_blank"
              >
                <GooglePlayBadgeIcon />
                <span className="mobile-home-app__store-text">
                  <span className="mobile-home-app__store-label">متوفر على</span>
                  <span className="mobile-home-app__store-name">Google Play</span>
                </span>
              </Link>
            </div>
          </div>

          <div aria-hidden className="mobile-home-app__device-wrap">
            <div className="mobile-home-app__device">
              <div className="mobile-home-app__device-island" />
              <div className="mobile-home-app__device-screen">
                <AppImage
                  alt=""
                  className="object-cover"
                  fallback="emirates"
                  fill
                  priority
                  sizes="160px"
                  src={APP_PREVIEW_IMAGES.hero}
                />
                <div className="mobile-home-app__device-overlay">
                  <div className="mobile-home-app__device-header">
                    <BrandMark size={18} variant="gold" />
                    <span className="mobile-home-app__device-brand">{BRAND.nameAr}</span>
                  </div>

                  <div className="mobile-home-app__device-search">
                    <Icon className="text-[var(--mh-gold)]" name="search" size={8} />
                    <span>ابحث في سوقنا...</span>
                  </div>

                  <div className="mobile-home-app__device-featured">
                    <AppImage
                      alt=""
                      className="object-cover"
                      fallbackCategory="cars"
                      fill
                      priority
                      sizes="140px"
                      src={APP_PREVIEW_IMAGES.featured}
                    />
                    <span className="mobile-home-app__device-featured-badge">مميز</span>
                    <span className="mobile-home-app__device-featured-price">895,000 د.إ</span>
                  </div>

                  <div className="mobile-home-app__device-thumbs">
                    <div className="mobile-home-app__device-thumb">
                      <AppImage
                        alt=""
                        className="object-cover"
                        fallbackCategory="real-estate"
                        fill
                        sizes="64px"
                        src={APP_PREVIEW_IMAGES.listingA}
                      />
                    </div>
                    <div className="mobile-home-app__device-thumb">
                      <AppImage
                        alt=""
                        className="object-cover"
                        fallbackCategory="electronics"
                        fill
                        sizes="64px"
                        src={APP_PREVIEW_IMAGES.listingB}
                      />
                    </div>
                  </div>

                  <span className="mobile-home-app__device-tag">تسوّق بثقة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

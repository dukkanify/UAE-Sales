import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { getListings } from "@/services/listings";
import { MobileAppDevicePreview } from "./MobileAppDevicePreview";
import { resolveAppPreviewListings } from "./mobile-app-preview.config";
import { MOBILE_APP_LINKS } from "./mobile-home.config";
import { AppStoreBadgeLink, GooglePlayBadgeLink } from "./MobileStoreBadges";

export async function MobileAppDownload() {
  const listings = await getListings();
  const previewListings = resolveAppPreviewListings(listings);

  return (
    <section aria-label="تطبيق سوقنا" className="mobile-home-app">
      <div className="mobile-home-app__panel">
        <span aria-hidden className="mobile-home-app__mesh" />
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--gold" />
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--depth" />

        <div className="mobile-home-app__layout">
          <div className="mobile-home-app__copy">
            <div className="mobile-home-app__brand">
              <BrandMark size={36} variant="gold" />
              <div className="mobile-home-app__brand-text">
                <p className="mobile-home-app__eyebrow">تطبيق الجوال</p>
                <p className="mobile-home-app__brand-name">{BRAND.nameAr}</p>
              </div>
            </div>

            <h2 className="mobile-home-app__title">
              السوق في راحة يدك
              <span className="mobile-home-app__title-brand">{BRAND.nameAr}</span>
            </h2>

            <p className="mobile-home-app__desc">
              تصفّح أوضح، تواصل أسرع، ونشر إعلانك بخطوات بسيطة من أي مكان في الإمارات.
            </p>
          </div>

          <div aria-hidden className="mobile-home-app__device-wrap">
            <span className="mobile-home-app__device-aura" />
            <div className="mobile-home-app__device">
              <div className="mobile-home-app__device-island" />
              <div className="mobile-home-app__device-screen">
                {previewListings.length > 0 ? (
                  <MobileAppDevicePreview listings={previewListings} />
                ) : (
                  <div className="mobile-home-app__device-fallback" />
                )}
              </div>
            </div>
          </div>

          <div className="mobile-home-app__actions">
            <AppStoreBadgeLink href={MOBILE_APP_LINKS.appStore} />
            <GooglePlayBadgeLink href={MOBILE_APP_LINKS.playStore} />
          </div>
        </div>
      </div>
    </section>
  );
}

import { BRAND } from "@/shared/constants/brand";
import { Icon } from "@/shared/ui/Icon";
import { getFeaturedListings } from "@/services/listings";
import { MobileAppDevicePreview } from "./MobileAppDevicePreview";
import { MOBILE_APP_LINKS } from "./mobile-home.config";
import { AppStoreBadgeLink, GooglePlayBadgeLink } from "./MobileStoreBadges";

const APP_FEATURES = [
  { icon: "bell" as const, label: "إشعارات فورية" },
  { icon: "message" as const, label: "محادثات مباشرة" },
  { icon: "grid" as const, label: "إدارة إعلاناتك" },
] as const;

export async function MobileAppDownload() {
  const featured = await getFeaturedListings();

  return (
    <section aria-label="تطبيق سوقنا" className="mobile-home-app">
      <div className="mobile-home-app__panel">
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--gold" />
        <span aria-hidden className="mobile-home-app__glow mobile-home-app__glow--navy" />

        <div className="mobile-home-app__layout">
          <div aria-hidden className="mobile-home-app__device-wrap">
            <div className="mobile-home-app__device">
              <div className="mobile-home-app__device-island" />
              <div className="mobile-home-app__device-screen">
                {previewListing ? (
                  <MobileAppDevicePreview listings={featured.slice(0, 2)} />
                ) : (
                  <div className="mobile-home-app__device-fallback" />
                )}
              </div>
            </div>
          </div>

          <div className="mobile-home-app__copy">
            <span className="mobile-home-app__eyebrow">
              <Icon name="phone" size={13} />
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
                  <span className="mobile-home-app__feature-icon">
                    <Icon name={feature.icon} size={13} />
                  </span>
                  {feature.label}
                </li>
              ))}
            </ul>

            <div className="mobile-home-app__badges">
              <AppStoreBadgeLink href={MOBILE_APP_LINKS.appStore} />
              <GooglePlayBadgeLink href={MOBILE_APP_LINKS.playStore} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

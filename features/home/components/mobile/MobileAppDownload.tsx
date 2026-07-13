import Link from "next/link";
import { BRAND } from "@/shared/constants/brand";
import { Icon } from "@/shared/ui/Icon";
import { getFeaturedListings } from "@/services/listings";
import { MobileAppDevicePreview } from "./MobileAppDevicePreview";
import { MOBILE_APP_LINKS } from "./mobile-home.config";
import { AppStoreBadgeSvg, GooglePlayBadgeSvg } from "./MobileStoreBadges";

const APP_FEATURES = [
  { icon: "bell" as const, label: "إشعارات فورية" },
  { icon: "message" as const, label: "محادثات مباشرة" },
  { icon: "grid" as const, label: "إدارة إعلاناتك" },
] as const;

export async function MobileAppDownload() {
  const featured = await getFeaturedListings();
  const previewListing = featured.find((listing) => listing.isFeatured) ?? featured[0];

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
                aria-label="حمّل من App Store"
                className="mobile-home-app__store-badge"
                href={MOBILE_APP_LINKS.appStore}
                rel="noopener noreferrer"
                target="_blank"
              >
                <AppStoreBadgeSvg />
              </Link>
              <Link
                aria-label="متوفر على Google Play"
                className="mobile-home-app__store-badge"
                href={MOBILE_APP_LINKS.playStore}
                rel="noopener noreferrer"
                target="_blank"
              >
                <GooglePlayBadgeSvg />
              </Link>
            </div>
          </div>

          <div aria-hidden className="mobile-home-app__device-wrap">
            <div className="mobile-home-app__device">
              <div className="mobile-home-app__device-island" />
              <div className="mobile-home-app__device-screen">
                {previewListing ? (
                  <MobileAppDevicePreview listing={previewListing} />
                ) : (
                  <div className="mobile-home-app__device-fallback" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

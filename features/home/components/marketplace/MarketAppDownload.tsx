import type { Listing } from "@/types";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { Icon } from "@/shared/ui/Icon";
import { MobileAppDevicePreview } from "@/features/home/components/mobile/MobileAppDevicePreview";
import { resolveAppPreviewListings } from "@/features/home/components/mobile/mobile-app-preview.config";
import { MOBILE_APP_LINKS } from "@/features/home/components/mobile/mobile-home.config";
import {
  AppStoreBadgeLink,
  GooglePlayBadgeLink,
} from "@/features/home/components/mobile/MobileStoreBadges";
import "./market-app-download.css";

const APP_FEATURES = [
  { icon: "bell" as const, label: "إشعارات فورية لكل عرض جديد" },
  { icon: "message" as const, label: "محادثات مباشرة مع البائعين" },
  { icon: "grid" as const, label: "إدارة إعلاناتك من أي مكان" },
] as const;

type MarketAppDownloadProps = {
  previewListings?: Listing[];
};

export function MarketAppDownload({ previewListings = [] }: MarketAppDownloadProps) {
  const preview = resolveAppPreviewListings(previewListings);

  return (
    <section aria-label="تطبيق سوقنا" className="market-app-download">
      <div aria-hidden className="market-app-download__mesh" />
      <span aria-hidden className="market-app-download__orb market-app-download__orb--gold" />
      <span aria-hidden className="market-app-download__orb market-app-download__orb--ink" />

      <div className="app-container relative z-10 px-4">
        <div className="market-app-download__shell">
          <div className="market-app-download__copy">
            <div className="mb-5 inline-flex items-center gap-3">
              <BrandMark size={42} variant="gold" />
              <span className="market-app-download__eyebrow">
                <Icon name="phone" size={14} />
                تطبيق {BRAND.nameAr}
              </span>
            </div>

            <h2 className="market-app-download__title">
              السوق في راحة يدك
              <br />
              مع{" "}
              <span className="market-app-download__title-brand">{BRAND.nameAr}</span>
            </h2>

            <p className="market-app-download__desc">
              تجربة سوقنا كاملة على الجوال — تصفّح أسرع، تواصل أوضح، ونشر إعلانك
              بخطوات بسيطة من أي مكان في الإمارات.
            </p>

            <ol className="market-app-download__features">
              {APP_FEATURES.map((feature, index) => (
                <li key={feature.label} className="market-app-download__feature">
                  <span className="market-app-download__feature-index">
                    0{index + 1}
                  </span>
                  <span className="market-app-download__feature-label">
                    <span className="market-app-download__feature-icon">
                      <Icon name={feature.icon} size={14} />
                    </span>
                    {feature.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="market-app-download__actions">
              <AppStoreBadgeLink href={MOBILE_APP_LINKS.appStore} />
              <GooglePlayBadgeLink href={MOBILE_APP_LINKS.playStore} />
            </div>
          </div>

          <div className="market-app-download__stage">
            <span aria-hidden className="market-app-download__ring" />
            <div className="market-app-download__device">
              <div className="market-app-download__device-island" />
              <div className="market-app-download__device-screen">
                {preview.length > 0 ? (
                  <MobileAppDevicePreview listings={preview} />
                ) : (
                  <div className="size-full bg-[#e8edf2]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

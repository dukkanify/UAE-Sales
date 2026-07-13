import Link from "next/link";
import { BRAND } from "@/shared/constants/brand";
import { Icon } from "@/shared/ui/Icon";
import { MOBILE_APP_LINKS } from "./mobile-home.config";

export function MobileAppDownload() {
  return (
    <section aria-label="تطبيق سوقنا" className="mobile-home-app">
      <div className="mobile-home-app__panel">
        <div className="mobile-home-app__copy">
          <p className="mobile-home-app__eyebrow">حمّل التطبيق</p>
          <h2 className="mobile-home-app__title">
            تسوّق أسرع مع تطبيق {BRAND.nameEn}
          </h2>
          <p className="mobile-home-app__desc">
            إشعارات فورية، محادثات مباشرة، وإدارة إعلاناتك من هاتفك.
          </p>

          <div className="mobile-home-app__badges">
            <Link
              className="mobile-home-app__badge"
              href={MOBILE_APP_LINKS.appStore}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon name="phone" size={16} />
              <span>
                <span className="mobile-home-app__badge-label">حمّل من</span>
                <span className="mobile-home-app__badge-store">App Store</span>
              </span>
            </Link>
            <Link
              className="mobile-home-app__badge"
              href={MOBILE_APP_LINKS.playStore}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon name="grid" size={16} />
              <span>
                <span className="mobile-home-app__badge-label">متوفر على</span>
                <span className="mobile-home-app__badge-store">Google Play</span>
              </span>
            </Link>
          </div>
        </div>

        <div aria-hidden className="mobile-home-app__phone">
          <div className="mobile-home-app__phone-notch" />
          <div className="mobile-home-app__phone-screen">
            <span className="mobile-home-app__phone-logo">{BRAND.nameAr}</span>
            <span className="mobile-home-app__phone-tag">تسوّق بثقة</span>
          </div>
        </div>
      </div>
    </section>
  );
}

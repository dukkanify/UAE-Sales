import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { heroBackgroundUrl } from "@/shared/constants/image-fallbacks";
import { getListingImageUrl } from "@/features/listings/components/listing-card.utils";
import { formatCurrencyDisplay } from "@/shared/utils/currency";
import { Icon } from "@/shared/ui/Icon";

type MobileAppDevicePreviewProps = {
  listing: Listing;
};

export function MobileAppDevicePreview({ listing }: MobileAppDevicePreviewProps) {
  const listingImage = getListingImageUrl(listing);

  return (
    <div className="mobile-home-app__device-preview" aria-hidden>
      <div className="mobile-home-app__mock">
        <header className="mobile-home-app__mock-header">
          <div className="mobile-home-app__mock-header-brand">
            <BrandMark size={22} variant="default" />
            <span className="mobile-home-app__mock-header-title">{BRAND.nameAr}</span>
          </div>
          <span className="mobile-home-app__mock-header-pill">
            <Icon name="map" size={10} />
            دبي
          </span>
        </header>

        <div className="mobile-home-app__mock-hero">
          <AppImage
            alt=""
            aria-hidden
            className="object-cover"
            fallback="emirates"
            fill
            priority
            sizes="220px"
            src={heroBackgroundUrl}
          />
          <div className="mobile-home-app__mock-hero-overlay" />
          <span className="mobile-home-app__mock-hero-badge">منصة إماراتية موثوقة</span>
        </div>

        <div className="mobile-home-app__mock-search">
          <div className="mobile-home-app__mock-search-field">
            <Icon name="search" size={12} />
            <span>ابحث عن أي شيء...</span>
          </div>
          <span className="mobile-home-app__mock-search-btn">بحث</span>
        </div>

        <div className="mobile-home-app__mock-section-label">
          <Icon name="star" size={11} />
          إعلانات مميزة
        </div>

        <article className="mobile-home-app__mock-listing">
          <div className="mobile-home-app__mock-listing-media">
            <AppImage
              alt=""
              aria-hidden
              className="object-contain"
              fallbackCategory={listing.categoryId}
              fill
              sizes="120px"
              src={listingImage}
            />
            {listing.isFeatured ? (
              <span className="mobile-home-app__mock-listing-badge">مميز</span>
            ) : null}
          </div>
          <div className="mobile-home-app__mock-listing-body">
            <p className="mobile-home-app__mock-listing-title">{listing.title}</p>
            <p className="mobile-home-app__mock-listing-price" dir="ltr">
              {formatCurrencyDisplay(listing.price, "ar-AE")}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

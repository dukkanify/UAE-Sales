import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { getListingImageUrl, getListingLocation } from "@/features/listings/components/listing-card.utils";
import { formatCurrencyDisplay } from "@/shared/utils/currency";
import { Icon } from "@/shared/ui/Icon";

type MobileAppDevicePreviewProps = {
  listings: Listing[];
};

const CATEGORY_CHIPS = ["سيارات", "عقارات", "إلكترونيات"] as const;

function MockListingCard({ listing }: { listing: Listing }) {
  const listingImage = getListingImageUrl(listing);
  const location = getListingLocation(listing);

  return (
    <article className="mobile-home-app__mock-card">
      <div className="mobile-home-app__mock-card-media">
        <AppImage
          alt=""
          aria-hidden
          className="object-cover"
          fallbackCategory={listing.categoryId}
          fill
          sizes="96px"
          src={listingImage}
        />
        {listing.isFeatured ? (
          <span className="mobile-home-app__mock-card-badge">مميز</span>
        ) : null}
      </div>
      <div className="mobile-home-app__mock-card-body">
        <p className="mobile-home-app__mock-card-title">{listing.title}</p>
        <p className="mobile-home-app__mock-card-meta">{location}</p>
        <p className="mobile-home-app__mock-card-price" dir="ltr">
          {formatCurrencyDisplay(listing.price, "ar-AE")}
        </p>
      </div>
    </article>
  );
}

export function MobileAppDevicePreview({ listings }: MobileAppDevicePreviewProps) {
  const primary = listings[0];
  const secondary = listings[1];

  if (!primary) return null;

  return (
    <div className="mobile-home-app__device-preview" aria-hidden>
      <div className="mobile-home-app__mock">
        <div className="mobile-home-app__mock-status">
          <span>9:41</span>
          <span className="mobile-home-app__mock-status-icons">
            <span />
            <span />
            <span />
          </span>
        </div>

        <header className="mobile-home-app__mock-header">
          <div className="mobile-home-app__mock-header-brand">
            <BrandMark size={18} variant="default" />
            <div className="mobile-home-app__mock-header-copy">
              <span className="mobile-home-app__mock-header-en">{BRAND.nameEn}</span>
              <span className="mobile-home-app__mock-header-ar">{BRAND.nameAr}</span>
            </div>
          </div>
          <span className="mobile-home-app__mock-header-pill">
            <Icon name="map" size={9} />
            دبي
          </span>
        </header>

        <div className="mobile-home-app__mock-search-pill">
          <Icon name="search" size={11} />
          <span>ابحث في سوقنا...</span>
        </div>

        <div className="mobile-home-app__mock-chips">
          {CATEGORY_CHIPS.map((chip, index) => (
            <span
              key={chip}
              className={`mobile-home-app__mock-chip${index === 0 ? " mobile-home-app__mock-chip--active" : ""}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mobile-home-app__mock-rail-head">
          <span className="mobile-home-app__mock-rail-title">
            <Icon name="star" size={10} />
            إعلانات مميزة
          </span>
          <span className="mobile-home-app__mock-rail-link">الكل</span>
        </div>

        <div className="mobile-home-app__mock-rail">
          <MockListingCard listing={primary} />
          {secondary ? (
            <MockListingCard listing={secondary} />
          ) : (
            <div aria-hidden className="mobile-home-app__mock-card mobile-home-app__mock-card--ghost">
              <div className="mobile-home-app__mock-card-media mobile-home-app__mock-card-media--ghost" />
              <div className="mobile-home-app__mock-card-body">
                <span className="mobile-home-app__mock-skeleton mobile-home-app__mock-skeleton--title" />
                <span className="mobile-home-app__mock-skeleton mobile-home-app__mock-skeleton--meta" />
                <span className="mobile-home-app__mock-skeleton mobile-home-app__mock-skeleton--price" />
              </div>
            </div>
          )}
        </div>

        <nav className="mobile-home-app__mock-nav">
          <span className="mobile-home-app__mock-nav-item mobile-home-app__mock-nav-item--active">
            <Icon name="home" size={11} />
          </span>
          <span className="mobile-home-app__mock-nav-item">
            <Icon name="grid" size={11} />
          </span>
          <span className="mobile-home-app__mock-nav-item mobile-home-app__mock-nav-item--fab">
            <Icon name="plus" size={12} />
          </span>
          <span className="mobile-home-app__mock-nav-item">
            <Icon name="message" size={11} />
          </span>
          <span className="mobile-home-app__mock-nav-item">
            <Icon name="user" size={11} />
          </span>
        </nav>
      </div>
    </div>
  );
}

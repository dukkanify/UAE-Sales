"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import {
  getListingImageUrl,
  getListingLocation,
} from "@/features/listings/components/listing-card.utils";
import { getAppPreviewImageUrl } from "./mobile-app-preview.config";
import { formatCurrencyDisplay } from "@/shared/utils/currency";
import { Icon } from "@/shared/ui/Icon";
import "./app-phone-mock.css";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type AppPhoneMockupProps = {
  listings: Listing[];
};

const CHIPS = ["سيارات", "عقارات", "موبايلات", "إلكترونيات"] as const;
const SLIDE_MS = 5200;

function coverUrl(listing: Listing): string {
  return getAppPreviewImageUrl(listing.slug, getListingImageUrl(listing));
}

function Cover({
  listing,
  sizes,
  priority = false,
}: {
  listing: Listing;
  sizes: string;
  priority?: boolean;
}) {
  return (
<LocalizedTree>
    <AppImage
      alt=""
      aria-hidden
      className="object-cover"
      fallbackCategory={listing.categoryId}
      fill
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      sizes={sizes}
      src={coverUrl(listing)}
    />
  </LocalizedTree>
);
}

function StatusBar() {
  return (
<LocalizedTree>
    <div className="app-phone__status">
      <span>9:41</span>
      <span className="app-phone__status-icons">
        <span />
        <span />
        <span />
      </span>
    </div>
  </LocalizedTree>
);
}

function TabBar({ active }: { active: "home" | "search" | "listing" }) {
  return (
<LocalizedTree>
    <nav className="app-phone__tabs">
      <span className={`app-phone__tab${active === "home" ? " is-active" : ""}`}>
        <Icon name="home" size={13} />
        <b>الرئيسية</b>
      </span>
      <span className={`app-phone__tab${active === "search" ? " is-active" : ""}`}>
        <Icon name="search" size={13} />
        <b>بحث</b>
      </span>
      <span className="app-phone__tab app-phone__tab--fab">
        <Icon name="plus" size={14} />
      </span>
      <span className="app-phone__tab">
        <Icon name="message" size={13} />
        <b>محادثات</b>
      </span>
      <span className="app-phone__tab">
        <Icon name="user" size={13} />
        <b>حسابي</b>
      </span>
    </nav>
  </LocalizedTree>
);
}

function HomeScreen({ listings }: { listings: Listing[] }) {
  const hero = listings[0];
  const next = listings[1];

  return (
<LocalizedTree>
    <div className="app-phone__screen">
      <StatusBar />
      <header className="app-phone__header">
        <div className="app-phone__brand">
          <BrandMark size={18} variant="default" />
          <span>
            <strong>{BRAND.nameAr}</strong>
            <small>{BRAND.nameEn}</small>
          </span>
        </div>
        <span className="app-phone__loc">
          <Icon name="map" size={9} />
          دبي
        </span>
      </header>

      <div className="app-phone__search">
        <Icon name="search" size={11} />
        <span>ابحث في سوقنا...</span>
      </div>

      <div className="app-phone__chips">
        {CHIPS.map((chip, index) => (
          <span key={chip} className={index === 0 ? "is-active" : undefined}>
            {chip}
          </span>
        ))}
      </div>

      {hero ? (
        <article className="app-phone__hero">
          <Cover listing={hero} priority sizes="280px" />
          <div className="app-phone__hero-meta">
            {hero.isFeatured ? <em>مميز</em> : null}
            <p dir="ltr">{formatCurrencyDisplay(hero.price, "ar-AE")}</p>
            <b>{hero.title}</b>
          </div>
        </article>
      ) : null}

      {next ? (
        <article className="app-phone__row">
          <div className="app-phone__thumb">
            <Cover listing={next} sizes="88px" />
          </div>
          <div className="app-phone__row-copy">
            <p dir="ltr">{formatCurrencyDisplay(next.price, "ar-AE")}</p>
            <b>{next.title}</b>
            <small>
              <Icon name="map" size={8} />
              {getListingLocation(next)}
            </small>
          </div>
        </article>
      ) : null}

      <TabBar active="home" />
    </div>
  </LocalizedTree>
);
}

function ListingScreen({ listing }: { listing?: Listing }) {
  if (!listing) return null;

  return (
<LocalizedTree>
    <div className="app-phone__screen">
      <StatusBar />
      <div className="app-phone__detail-photo">
        <Cover listing={listing} sizes="280px" />
        <span className="app-phone__back">
          <Icon name="chevron-left" size={12} />
        </span>
      </div>
      <div className="app-phone__detail-body">
        <p className="app-phone__kicker">{listing.subcategory ?? "إعلان مميز"}</p>
        <h3>{listing.title}</h3>
        <p className="app-phone__price" dir="ltr">
          {formatCurrencyDisplay(listing.price, "ar-AE")}
        </p>
        <small>
          <Icon name="map" size={9} />
          {getListingLocation(listing)}
        </small>
        <div className="app-phone__seller">
          <span>{listing.seller.name.slice(0, 1)}</span>
          <div>
            <b>{listing.seller.name}</b>
            <small>بائع موثّق</small>
          </div>
        </div>
        <div className="app-phone__cta">تواصل مع البائع</div>
      </div>
      <TabBar active="listing" />
    </div>
  </LocalizedTree>
);
}

function SearchScreen({ listings }: { listings: Listing[] }) {
  return (
<LocalizedTree>
    <div className="app-phone__screen">
      <StatusBar />
      <div className="app-phone__search app-phone__search--filled">
        <Icon name="search" size={11} />
        <span>مرسيدس · دبي</span>
      </div>
      <div className="app-phone__results">
        {listings.slice(0, 3).map((listing) => (
          <article key={listing.id} className="app-phone__row">
            <div className="app-phone__thumb">
              <Cover listing={listing} sizes="88px" />
            </div>
            <div className="app-phone__row-copy">
              <p dir="ltr">{formatCurrencyDisplay(listing.price, "ar-AE")}</p>
              <b>{listing.title}</b>
              <small>
                <Icon name="map" size={8} />
                {getListingLocation(listing)}
              </small>
            </div>
          </article>
        ))}
      </div>
      <TabBar active="search" />
    </div>
  </LocalizedTree>
);
}

export function AppPhoneMockup({ listings }: AppPhoneMockupProps) {
  const [active, setActive] = useState(0);
  const slides = Math.min(3, listings.length > 0 ? 3 : 1);

  useEffect(() => {
    if (slides < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides]);

  return (
<LocalizedTree>
    <div aria-hidden className="app-phone">
      <div className={`app-phone__slide${active === 0 ? " is-visible" : ""}`}>
        <HomeScreen listings={listings} />
      </div>
      <div className={`app-phone__slide${active === 1 ? " is-visible" : ""}`}>
        <ListingScreen listing={listings[0]} />
      </div>
      <div className={`app-phone__slide${active === 2 ? " is-visible" : ""}`}>
        <SearchScreen listings={listings} />
      </div>
      <div className="app-phone__dots">
        {Array.from({ length: slides }, (_, index) => (
          <span key={index} className={index === active ? "is-active" : undefined} />
        ))}
      </div>
    </div>
  </LocalizedTree>
);
}

export { AppPhoneMockup as MobileAppDevicePreview };

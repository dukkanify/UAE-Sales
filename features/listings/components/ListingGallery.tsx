"use client";

import { useCallback, useEffect, useState } from "react";
import type { Listing } from "@/types";
import { getListingImages } from "@/features/listings/components/listing-card.utils";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type ListingGalleryProps = {
  listing: Listing;
};

const GALLERY_OVERLAY_BTN_CLASS =
  "!min-h-0 !size-8 !min-w-0 !rounded-full !border-0 !bg-white/92 !p-0 !shadow-sm backdrop-blur-sm";

export function ListingGallery({ listing }: ListingGalleryProps) {
  const galleryImages = getListingImages(listing);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(
      (current) => (current - 1 + galleryImages.length) % galleryImages.length,
    );
  }, [galleryImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, lightboxOpen]);

  if (galleryImages.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fallbackCategory={listing.categoryId}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          src=""
        />
      </div>
    );
  }

  const activeImage = galleryImages[activeIndex];

  return (
    <>
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border shadow-[var(--shadow-lg)]">
          <button
            aria-label="عرض جميع الصور"
            className="relative block size-full"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            <AppImage
              alt={listing.title}
              className="object-cover"
              fallbackCategory={listing.categoryId}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              src={activeImage}
            />
          </button>

          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5">
            <div className="hidden min-w-0 flex-1 flex-wrap gap-1.5 lg:flex">
              {listing.isFeatured ? <Badge variant="featured">إعلان مميز</Badge> : null}
              {listing.isPremium ? <Badge variant="premium">بريميوم</Badge> : null}
              {listing.verifiedSeller ? <Badge variant="verified">بائع موثق</Badge> : null}
              {showsEscrowProtection(listing) ? (
                <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
              ) : null}
            </div>

            <div className="ms-auto flex shrink-0 gap-1 lg:hidden">
              <FavoriteButton
                className={GALLERY_OVERLAY_BTN_CLASS}
                iconOnly
                listing={listing}
              />
              <ShareButton className={GALLERY_OVERLAY_BTN_CLASS} iconOnly listing={listing} />
            </div>
          </div>

          {galleryImages.length > 1 ? (
            <>
              <button
                aria-label="الصورة السابقة"
                className="focus-ring absolute start-2 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm sm:start-3 sm:size-9"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                type="button"
              >
                <Icon name="chevron-right" size={16} />
              </button>
              <button
                aria-label="الصورة التالية"
                className="focus-ring absolute end-2 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm sm:end-3 sm:size-9"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                type="button"
              >
                <Icon name="chevron-left" size={16} />
              </button>
              <p className="absolute bottom-2.5 end-2.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:end-3 sm:px-3 sm:py-1 sm:text-xs">
                {activeIndex + 1}
                <span className="px-0.5 opacity-80">/</span>
                {galleryImages.length}
              </p>
            </>
          ) : null}

          <button
            className="absolute bottom-4 start-4 hidden rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white lg:inline-flex"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            عرض جميع الصور
          </button>
        </div>

        {galleryImages.length > 1 ? (
          <div className="hidden w-[4.75rem] flex-col gap-1.5 overflow-y-auto lg:flex lg:max-h-[min(100%,28rem)]">
            {galleryImages.map((url, index) => (
              <button
                key={`${url}-${index}`}
                aria-label={`عرض صورة ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 transition ${activeIndex === index ? "border-secondary ring-2 ring-secondary/25" : "border-border opacity-80 hover:opacity-100"}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <AppImage
                  alt={`صورة ${index + 1}`}
                  className="object-cover"
                  fallbackCategory={listing.categoryId}
                  fill
                  loading="lazy"
                  sizes="76px"
                  src={url}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
          {galleryImages.map((url, index) => (
            <button
              key={`mobile-${url}-${index}`}
              aria-label={`عرض صورة ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeIndex === index ? "border-secondary ring-1 ring-secondary/30" : "border-border/80 opacity-75"}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <AppImage
                alt={`صورة ${index + 1}`}
                className="object-cover"
                fallbackCategory={listing.categoryId}
                fill
                loading="lazy"
                sizes="56px"
                src={url}
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4"
          role="dialog"
        >
          <button
            aria-label="إغلاق"
            className="focus-ring absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white/15 text-white"
            onClick={() => setLightboxOpen(false)}
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
          <button
            aria-label="الصورة السابقة"
            className="focus-ring absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            onClick={goPrev}
            type="button"
          >
            <Icon name="chevron-right" size={20} />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-[var(--radius-2xl)]">
            <AppImage
              alt={listing.title}
              className="object-contain"
              fallbackCategory={listing.categoryId}
              fill
              sizes="(max-width: 1024px) min(100vw, 64rem), 60vw"
              src={activeImage}
            />
          </div>
          <button
            aria-label="الصورة التالية"
            className="focus-ring absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            onClick={goNext}
            type="button"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <p className="absolute bottom-6 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white">
            {activeIndex + 1}
            <span className="px-0.5 opacity-80">/</span>
            {galleryImages.length}
          </p>
        </div>
      ) : null}
    </>
  );
}

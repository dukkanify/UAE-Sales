"use client";

import { useCallback, useEffect, useState } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type ListingGalleryProps = {
  listing: Listing;
};

export function ListingGallery({ listing }: ListingGalleryProps) {
  const galleryImages =
    listing.images && listing.images.length > 0
      ? listing.images
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];

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
      <div className="grid gap-3 lg:grid-cols-[1fr_7rem]">
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

          <div className="pointer-events-none absolute start-4 top-4 z-10 flex flex-wrap gap-2">
            {listing.isFeatured ? <Badge variant="featured">إعلان مميز</Badge> : null}
            {listing.isPremium ? <Badge variant="premium">بريميوم</Badge> : null}
            {listing.verifiedSeller ? <Badge variant="verified">بائع موثق</Badge> : null}
            {showsEscrowProtection(listing) ? (
              <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
            ) : null}
          </div>

          <div className="absolute end-3 top-3 z-10 flex gap-2 lg:hidden">
            <FavoriteButton iconOnly listing={listing} />
            <ShareButton iconOnly listing={listing} />
          </div>

          {galleryImages.length > 1 ? (
            <>
              <button
                aria-label="الصورة السابقة"
                className="focus-ring absolute start-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white"
                onClick={goPrev}
                type="button"
              >
                <Icon name="chevron-right" size={18} />
              </button>
              <button
                aria-label="الصورة التالية"
                className="focus-ring absolute end-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white"
                onClick={goNext}
                type="button"
              >
                <Icon name="chevron-left" size={18} />
              </button>
              <p className="absolute bottom-4 end-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                {activeIndex + 1} / {galleryImages.length}
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
          <div className="hidden max-h-[28rem] grid-cols-1 gap-2 overflow-y-auto lg:grid">
            {galleryImages.map((url, index) => (
              <button
                key={`${url}-${index}`}
                aria-label={`عرض صورة ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border-2 transition ${activeIndex === index ? "border-secondary ring-2 ring-secondary/25" : "border-border opacity-80 hover:opacity-100"}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <AppImage
                  alt={`صورة ${index + 1}`}
                  className="object-cover"
                  fallbackCategory={listing.categoryId}
                  fill
                  loading="lazy"
                  sizes="112px"
                  src={url}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {galleryImages.map((url, index) => (
            <button
              key={`mobile-${url}-${index}`}
              aria-label={`عرض صورة ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-[var(--radius-xl)] border-2 ${activeIndex === index ? "border-secondary" : "border-border"}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <AppImage
                alt={`صورة ${index + 1}`}
                className="object-cover"
                fallbackCategory={listing.categoryId}
                fill
                loading="lazy"
                sizes="80px"
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
            {activeIndex + 1} / {galleryImages.length}
          </p>
        </div>
      ) : null}
    </>
  );
}

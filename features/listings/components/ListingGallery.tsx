"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Listing } from "@/types";
import { getListingImages } from "@/features/listings/components/listing-card.utils";
import { ListingCardBadges } from "@/features/listings/components/ListingCardBadges";
import { AppImage } from "@/shared/components/AppImage";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { listingTitle } from "@/shared/i18n/listing-copy";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { useLocale } from "@/shared/i18n/useLocale";

type ListingGalleryProps = {
  listing: Listing;
};

type GalleryMediaItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

const GALLERY_OVERLAY_BTN_CLASS =
  "card-media-action !min-h-0 !size-8 !min-w-0 !rounded-full !p-0";

function buildGalleryItems(listing: Listing): GalleryMediaItem[] {
  const items: GalleryMediaItem[] = getListingImages(listing).map((src) => ({
    kind: "image",
    src,
  }));
  const videoUrl = listing.videoUrl?.trim();
  if (videoUrl) {
    items.push({ kind: "video", src: videoUrl });
  }
  return items;
}

function toVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

function GalleryMedia({
  item,
  alt,
  categoryId,
  className,
  fill = false,
  priority = false,
  sizes,
}: {
  item: GalleryMediaItem;
  alt: string;
  categoryId: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  if (item.kind === "image") {
    return (
      <AppImage
        alt={alt}
        className={className}
        fallbackCategory={categoryId}
        fill={fill}
        priority={priority}
        sizes={sizes}
        src={item.src}
      />
    );
  }

  const embedUrl = toVideoEmbedUrl(item.src);
  if (embedUrl) {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`${className ?? ""} absolute inset-0 size-full border-0`}
        src={embedUrl}
        title={alt}
      />
    );
  }

  return (
    <video
      className={`${className ?? ""} absolute inset-0 size-full bg-black object-contain`}
      controls
      playsInline
      preload="metadata"
      src={item.src}
    />
  );
}

export function ListingGallery({ listing }: ListingGalleryProps) {
  const galleryItems = useMemo(() => buildGalleryItems(listing), [listing]);
  const displayTitle = listingTitle(listing, useLocale());

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goNext = useCallback(() => {
    if (galleryItems.length === 0) return;
    setActiveIndex((current) => (current + 1) % galleryItems.length);
  }, [galleryItems.length]);

  const goPrev = useCallback(() => {
    if (galleryItems.length === 0) return;
    setActiveIndex(
      (current) => (current - 1 + galleryItems.length) % galleryItems.length,
    );
  }, [galleryItems.length]);

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

  const clampedIndex =
    galleryItems.length === 0 ? 0 : Math.min(activeIndex, galleryItems.length - 1);

  if (galleryItems.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface-muted">
        <AppImage
          alt={displayTitle}
          className="object-cover"
          fallbackCategory={listing.categoryId}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          src=""
        />
      </div>
    );
  }

  const activeItem = galleryItems[clampedIndex];
  const hasMultiple = galleryItems.length > 1;

  return (
    <LocalizedTree>
    <>
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border shadow-[var(--shadow-lg)]">
          <button
            aria-label="عرض جميع الوسائط"
            className="relative block size-full"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            <GalleryMedia
              alt={displayTitle}
              categoryId={listing.categoryId}
              className="object-cover"
              fill
              item={activeItem}
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {activeItem.kind === "video" ? (
              <span className="pointer-events-none absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                <span aria-hidden>▶</span>
                فيديو
              </span>
            ) : null}
          </button>

          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5">
            <div className="hidden min-w-0 flex-1 lg:block">
              <ListingCardBadges inline listing={listing} />
              {showsEscrowProtection(listing) ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
                </div>
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

          {hasMultiple ? (
            <>
              <button
                aria-label="الوسائط السابقة"
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
                aria-label="الوسائط التالية"
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
                {clampedIndex + 1}
                <span className="px-0.5 opacity-80">/</span>
                {galleryItems.length}
              </p>
            </>
          ) : null}

          <button
            className="absolute bottom-4 start-4 hidden rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white lg:inline-flex"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            عرض جميع الوسائط
          </button>
        </div>

        {hasMultiple ? (
          <div className="hidden w-[4.75rem] flex-col gap-1.5 overflow-y-auto lg:flex lg:max-h-[min(100%,28rem)]">
            {galleryItems.map((item, index) => (
              <button
                key={`${item.kind}-${item.src}-${index}`}
                aria-label={`عرض ${item.kind === "video" ? "الفيديو" : `صورة ${index + 1}`}`}
                aria-pressed={clampedIndex === index}
                className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 transition ${clampedIndex === index ? "border-secondary ring-2 ring-secondary/25" : "border-border opacity-80 hover:opacity-100"}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {item.kind === "image" ? (
                  <AppImage
                    alt={`صورة ${index + 1}`}
                    className="object-cover"
                    fallbackCategory={listing.categoryId}
                    fill
                    loading="lazy"
                    sizes="76px"
                    src={item.src}
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-black/80 text-sm font-bold text-white">
                    ▶
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
          {galleryItems.map((item, index) => (
            <button
              key={`mobile-${item.kind}-${item.src}-${index}`}
              aria-label={`عرض ${item.kind === "video" ? "الفيديو" : `صورة ${index + 1}`}`}
              aria-pressed={clampedIndex === index}
              className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${clampedIndex === index ? "border-secondary ring-1 ring-secondary/30" : "border-border/80 opacity-75"}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              {item.kind === "image" ? (
                <AppImage
                  alt={`صورة ${index + 1}`}
                  className="object-cover"
                  fallbackCategory={listing.categoryId}
                  fill
                  loading="lazy"
                  sizes="56px"
                  src={item.src}
                />
              ) : (
                <div className="grid size-full place-items-center bg-black/80 text-xs font-bold text-white">
                  ▶
                </div>
              )}
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
            aria-label="الوسائط السابقة"
            className="focus-ring absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            onClick={goPrev}
            type="button"
          >
            <Icon name="chevron-right" size={20} />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-[var(--radius-2xl)]">
            <GalleryMedia
              alt={displayTitle}
              categoryId={listing.categoryId}
              className="object-contain"
              fill
              item={activeItem}
              sizes="(max-width: 1024px) min(100vw, 64rem), 60vw"
            />
          </div>
          <button
            aria-label="الوسائط التالية"
            className="focus-ring absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white"
            onClick={goNext}
            type="button"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <p className="absolute bottom-6 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white">
            {clampedIndex + 1}
            <span className="px-0.5 opacity-80">/</span>
            {galleryItems.length}
          </p>
        </div>
      ) : null}
    </>
    </LocalizedTree>
  );
}

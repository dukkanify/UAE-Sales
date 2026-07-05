"use client";

import { useState } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";

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
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-[#e8e4de] shadow-[var(--shadow-lg)] lg:min-h-[28rem]">
        {activeImage ? (
          <AppImage
            alt={listing.title}
            className="object-cover transition duration-500"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={activeImage}
          />
        ) : (
          <div className="grid h-full min-h-[20rem] place-items-center text-muted">
            <Badge variant="muted">لا توجد صورة</Badge>
          </div>
        )}
        <div className="absolute start-4 top-4 z-10 flex flex-wrap gap-2">
          {listing.isFeatured ? <Badge variant="featured">إعلان مميز</Badge> : null}
          {listing.isPremium ? <Badge variant="premium">بريميوم</Badge> : null}
          {listing.verifiedSeller ? <Badge variant="verified">بائع موثق</Badge> : null}
          {listing.escrowAvailable ? <Badge variant="escrow">ضمان مالي</Badge> : null}
        </div>
        {galleryImages.length > 1 ? (
          <p className="absolute bottom-4 end-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
            {activeIndex + 1} / {galleryImages.length}
          </p>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              aria-label={`عرض صورة ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--radius-xl)] border-2 transition ${activeIndex === index ? "border-secondary ring-2 ring-secondary/25" : "border-border opacity-80 hover:opacity-100"}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <AppImage
                alt={`صورة ${index + 1}`}
                className="object-cover"
                fill
                loading={index === 0 ? undefined : "lazy"}
                sizes="96px"
                src={url}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

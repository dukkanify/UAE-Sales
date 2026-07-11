"use client";

import { useEffect, useMemo, useState } from "react";
import type { Listing } from "@/types";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getLocalListings } from "@/services/storage";

const STORAGE_KEY = STORAGE_KEYS.recentlyViewed;

type RecentlyViewedTrackerProps = {
  listing: Listing;
};

export function RecentlyViewedTracker({ listing }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: { slug: string; viewedAt: string }[] = raw
        ? JSON.parse(raw)
        : [];
      const filtered = existing.filter((item) => item.slug !== listing.slug);
      const next = [
        { slug: listing.slug, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(STORAGE_EVENTS.recentlyViewedChange));
    } catch {
      // ignore storage errors
    }
  }, [listing.slug]);

  return null;
}

type RecentlyViewedSectionProps = {
  categories: { id: string; name: string }[];
  currentSlug: string;
  listings: Listing[];
};

export function RecentlyViewedSection({
  categories,
  currentSlug,
  listings,
}: RecentlyViewedSectionProps) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [localListings, setLocalListings] = useState<Listing[]>([]);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const items: { slug: string }[] = raw ? JSON.parse(raw) : [];
        setSlugs(
          items
            .map((item) => item.slug)
            .filter((slug) => slug !== currentSlug)
            .slice(0, 3),
        );
        setLocalListings(getLocalListings());
      } catch {
        setSlugs([]);
        setLocalListings([]);
      }
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.recentlyViewedChange, sync);
    window.addEventListener(STORAGE_EVENTS.listingsChange, sync);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.recentlyViewedChange, sync);
      window.removeEventListener(STORAGE_EVENTS.listingsChange, sync);
    };
  }, [currentSlug]);

  const catalog = useMemo(
    () => [...localListings, ...listings],
    [listings, localListings],
  );

  const recentListings = slugs
    .map((slug) => catalog.find((listing) => listing.slug === slug))
    .filter((listing): listing is Listing => Boolean(listing));

  if (recentListings.length === 0) {
    return null;
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <section className="app-container page-padding">
      <SectionHeader
        description="إعلانات شاهدتها مؤخراً في هذه الجلسة."
        eyebrow="سجل التصفح"
        title="شاهدت مؤخراً"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recentListings.map((listing) => (
          <ListingCard
            key={listing.id}
            categoryName={categoryMap.get(listing.categoryId)}
            listing={listing}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Listing } from "@/types";
import { getListingImageUrl } from "@/features/listings/components/listing-card.utils";
import {
  getFavoritesSnapshot,
  subscribeFavorites,
} from "@/services/storage/external-store";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { useSyncExternalStore } from "react";
import { useToast } from "@/shared/components/ToastProvider";
import { Icon } from "@/shared/ui/Icon";
import { toggleFavoriteWithApi } from "@/services/favorites/favorites-sync";

type FavoriteButtonProps = {
  className?: string;
  iconOnly?: boolean;
  listing: Listing;
};

const baseClass =
  "focus-ring interactive-lift inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-semibold text-ink transition";

export function FavoriteButton({
  className = "",
  iconOnly = false,
  listing,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const isFavorite = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().some((item) => item.listingId === listing.id),
    () => false,
  );

  const isLoggedIn = useSyncExternalStore(
    subscribeSession,
    () => Boolean(getSessionSnapshot()),
    () => false,
  );

  const handleToggle = useCallback(async () => {
    const listingPath = listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`;

    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(listingPath)}`);
      return;
    }

    const entry = {
      listingId: listing.id,
      slug: listing.slug,
      title: listing.title,
      price: listing.price,
      imageUrl: getListingImageUrl(listing),
      savedAt: new Date().toISOString(),
    };

    try {
      const added = await toggleFavoriteWithApi(entry);
      showToast(
        added
          ? "تمت إضافة الإعلان إلى المفضلة"
          : "تمت إزالة الإعلان من المفضلة",
      );
    } catch {
      showToast("تعذر تحديث المفضلة. حاول مرة أخرى.", "error");
    }
  }, [isLoggedIn, listing, router, showToast]);

  return (
    <button
      aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      aria-pressed={isFavorite}
      className={`${baseClass} ${isFavorite ? "border-accent/40 bg-accent-soft text-accent" : ""} ${className}`}
      onClick={handleToggle}
      type="button"
    >
      <Icon filled={isFavorite} name={isFavorite ? "heart-filled" : "heart"} size={18} />
      {!iconOnly ? (isFavorite ? "محفوظ" : "مفضلة") : null}
    </button>
  );
}

export function useFavoritesList() {
  return useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot(),
    () => [],
  );
}

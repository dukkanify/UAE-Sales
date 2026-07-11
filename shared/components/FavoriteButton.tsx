"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Listing } from "@/types";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { useToast } from "@/shared/components/ToastProvider";
import { Icon } from "@/shared/ui/Icon";
import {
  getFavorites,
  getSessionUser,
  isFavoriteListing,
} from "@/services/storage";
import {
  hydrateFavoritesFromServer,
  toggleFavoriteWithApi,
} from "@/services/favorites/favorites-sync";

type FavoriteButtonProps = {
  className?: string;
  iconOnly?: boolean;
  listing: Listing;
};

const baseClass =
  "focus-ring interactive-lift inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-semibold text-ink transition";

function subscribe(callback: () => void) {
  window.addEventListener(STORAGE_EVENTS.favoritesChange, callback);
  return () => window.removeEventListener(STORAGE_EVENTS.favoritesChange, callback);
}

export function FavoriteButton({
  className = "",
  iconOnly = false,
  listing,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const isFavorite = useSyncExternalStore(
    subscribe,
    () => isFavoriteListing(listing.id),
    () => false,
  );

  useEffect(() => {
    const user = getSessionUser();
    if (!user) return;
    hydrateFavoritesFromServer(user.id).catch(() => undefined);
  }, []);

  const handleToggle = useCallback(async () => {
    const user = getSessionUser();
    const listingPath = listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(listingPath)}`);
      return;
    }

    const entry = {
      listingId: listing.id,
      slug: listing.slug,
      title: listing.title,
      price: listing.price,
      imageUrl: listing.imageUrl ?? listing.images?.[0],
      savedAt: new Date().toISOString(),
    };

    const added = await toggleFavoriteWithApi(user.id, entry);

    showToast(
      added
        ? "تمت إضافة الإعلان إلى المفضلة"
        : "تمت إزالة الإعلان من المفضلة",
    );
  }, [listing, router, showToast]);

  return (
    <button
      aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      aria-pressed={isFavorite}
      className={`${baseClass} ${isFavorite ? "border-accent/40 bg-accent-soft text-accent" : ""} ${className}`}
      onClick={handleToggle}
      type="button"
    >
      <Icon name="heart" size={18} />
      {!iconOnly ? (isFavorite ? "محفوظ" : "مفضلة") : null}
    </button>
  );
}

export function useFavoritesList() {
  return useSyncExternalStore(subscribe, () => getFavorites(), () => []);
}

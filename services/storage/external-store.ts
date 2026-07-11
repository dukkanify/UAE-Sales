"use client";

import type { UserProfile } from "@/types";
import type { FavoriteRecord } from "@/services/storage/client-storage";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";

const EMPTY_FAVORITES: FavoriteRecord[] = [];

let favoritesSnapshot = {
  serialized: "",
  value: EMPTY_FAVORITES,
};

let sessionSnapshot: {
  serialized: string;
  value: UserProfile | null;
} = {
  serialized: "",
  value: null,
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function invalidateFavoritesSnapshot() {
  favoritesSnapshot = { serialized: "", value: EMPTY_FAVORITES };
}

export function invalidateSessionSnapshot() {
  sessionSnapshot = { serialized: "", value: null };
}

export function getFavoritesSnapshot(): FavoriteRecord[] {
  if (!canUseStorage()) {
    return EMPTY_FAVORITES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.favorites) ?? "";
  if (raw === favoritesSnapshot.serialized) {
    return favoritesSnapshot.value;
  }

  const value = raw ? (JSON.parse(raw) as FavoriteRecord[]) : EMPTY_FAVORITES;
  favoritesSnapshot = { serialized: raw, value };
  return value;
}

export function getSessionSnapshot(): UserProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.session) ?? "";
  if (raw === sessionSnapshot.serialized) {
    return sessionSnapshot.value;
  }

  const value = raw ? (JSON.parse(raw) as UserProfile) : null;
  sessionSnapshot = { serialized: raw, value };
  return value;
}

export function subscribeFavorites(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(STORAGE_EVENTS.favoritesChange, handler);
  return () => window.removeEventListener(STORAGE_EVENTS.favoritesChange, handler);
}

export function subscribeSession(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(STORAGE_EVENTS.sessionChange, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORAGE_EVENTS.sessionChange, handler);
    window.removeEventListener("storage", handler);
  };
}

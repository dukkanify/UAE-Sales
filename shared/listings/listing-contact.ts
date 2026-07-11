import type { Listing } from "@/types";

function normalizeUaePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("971")) return digits;
  if (digits.startsWith("0")) return `971${digits.slice(1)}`;
  if (digits.startsWith("5")) return `971${digits}`;
  return digits;
}

export function getListingContactPhone(listing: Listing): string | null {
  const raw = listing.contactPhone?.trim();
  if (!raw) return null;
  const normalized = normalizeUaePhone(raw);
  return normalized.length >= 10 ? normalized : null;
}

export function getMaskedPhone(listing: Listing): string | null {
  const phone = getListingContactPhone(listing);
  if (!phone) return null;
  const local = phone.startsWith("971") ? `0${phone.slice(3)}` : phone;
  if (local.length < 6) return null;
  return `${local.slice(0, 3)} *** ${local.slice(-2)}`;
}

export function getTelHref(listing: Listing): string | null {
  const phone = getListingContactPhone(listing);
  if (!phone) return null;
  const local = phone.startsWith("971") ? `0${phone.slice(3)}` : phone;
  return `tel:${local}`;
}

export function getWhatsAppHref(
  listing: Listing,
  listingUrl: string,
): string | null {
  const phone = getListingContactPhone(listing);
  if (!phone) return null;
  const message = `مرحباً، أتواصل معك بخصوص إعلان "${listing.title}" على سوقنا.\nرابط الإعلان: ${listingUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

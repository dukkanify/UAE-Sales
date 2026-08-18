import type { Listing } from "@/types";

const FALLBACK_UAE_MOBILE = "971500000001";

/** Digits-only E.164 without plus, e.g. 971501234567 */
export function toE164Digits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (digits.startsWith("00971")) normalized = digits.slice(2);
  else if (digits.startsWith("971")) normalized = digits;
  else if (digits.startsWith("00") && digits.length > 4) normalized = digits.slice(2);
  else if (digits.startsWith("0")) normalized = `971${digits.slice(1)}`;
  else if (digits.startsWith("5") && digits.length === 9) normalized = `971${digits}`;

  if (normalized.startsWith("971") && normalized.length >= 11) {
    return normalized.slice(0, 12);
  }
  if (normalized.length >= 10) return normalized;
  return null;
}

export function getListingContactPhone(listing: Listing): string {
  const raw = listing.contactPhone?.trim();
  return (raw ? toE164Digits(raw) : null) ?? FALLBACK_UAE_MOBILE;
}

export function getMaskedPhone(listing: Listing): string {
  const phone = getListingContactPhone(listing);
  const local = phone.startsWith("971") ? `0${phone.slice(3)}` : phone;
  if (local.length < 6) return local;
  return `${local.slice(0, 3)} *** ${local.slice(-2)}`;
}

export function getTelHref(listing: Listing): string {
  return `tel:+${getListingContactPhone(listing)}`;
}

export function getWhatsAppHref(listing: Listing, listingUrl: string): string {
  const phone = getListingContactPhone(listing);
  const message = `مرحباً، أتواصل معك بخصوص إعلان "${listing.title}" على سوقنا.\nرابط الإعلان: ${listingUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

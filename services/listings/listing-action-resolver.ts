import type { Listing } from "@/types";
import {
  getServerListingById,
  getServerListingBySlug,
} from "@/services/payments/listing-resolver";

const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ATTACHMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

export function resolveServerListing(listingId: string): Listing | undefined {
  return (
    getServerListingById(listingId) ?? getServerListingBySlug(listingId)
  );
}

export function assertNotOwnListing(
  listing: Listing | undefined,
  actorId: string,
  clientSellerId: string,
): string | null {
  const sellerId = listing?.seller.id ?? clientSellerId;
  if (actorId === sellerId) {
    return "CANNOT_ACT_ON_OWN_LISTING";
  }
  return null;
}

export function validateCvFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return CV_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateAttachmentName(fileName?: string): boolean {
  if (!fileName) return true;
  const lower = fileName.toLowerCase();
  return ATTACHMENT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateFutureDate(date: string): boolean {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed > today;
}

export function validatePreferredDate(date: string): boolean {
  return validateFutureDate(date);
}

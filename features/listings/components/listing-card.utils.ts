import type { Listing } from "@/types";

export const listingPriceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function getListingHref(listing: Listing): string {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

export function getListingLocation(listing: Listing): string {
  if (listing.area) {
    return `${listing.area}، ${listing.emirate ?? listing.city}`;
  }
  return listing.emirate ?? listing.city;
}

export function getListingImageUrl(listing: Listing): string {
  return listing.images?.[0] ?? listing.imageUrl ?? "";
}

export const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export const conditionBadgeVariant: Record<
  Listing["condition"],
  "new" | "muted" | "premium"
> = {
  excellent: "premium",
  new: "new",
  used: "muted",
};

export function formatPostedTime(postedAt?: string): string {
  if (!postedAt) {
    return "منذ ساعة";
  }

  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "الآن";
  }
  if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`;
  }
  if (diffDays === 1) {
    return "أمس";
  }
  if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  }

  return posted.toLocaleDateString("ar-AE", {
    day: "numeric",
    month: "short",
  });
}

export function formatViews(views: number): string {
  return views.toLocaleString("ar-AE");
}

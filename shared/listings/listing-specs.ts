import type { Listing } from "@/types";
import { getCategoryFieldLabel, getCategoryFields } from "@/shared/constants/category-fields";

export type SpecEntry = {
  key: string;
  label: string;
  value: string;
};

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== "—";
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return false;
}

function formatValue(key: string, value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "نعم" : "لا";
  }
  if (key === "area" || key === "areaSqft") {
    return `${Number(value).toLocaleString("ar-AE")} قدم مربع`;
  }
  if (key === "mileage") {
    return `${value} كم`;
  }
  return String(value);
}

function isUserCreatedListing(listing: Listing): boolean {
  return listing.id.startsWith("local-");
}

/** Extract typed mock specs — only for catalog listings */
function getMockSpecEntries(listing: Listing): SpecEntry[] {
  const entries: SpecEntry[] = [];

  if (listing.carSpecs) {
    for (const [key, value] of Object.entries(listing.carSpecs)) {
      if (!hasValue(value)) continue;
      entries.push({
        key,
        label: getCategoryFieldLabel("cars", key),
        value: formatValue(key, value),
      });
    }
  }

  if (listing.realEstateSpecs) {
    const { amenities, ...rest } = listing.realEstateSpecs;
    for (const [key, value] of Object.entries(rest)) {
      if (!hasValue(value)) continue;
      entries.push({
        key,
        label: getCategoryFieldLabel("real-estate", key),
        value: formatValue(key, value as string | number),
      });
    }
    if (hasValue(amenities) && amenities.length > 0) {
      entries.push({
        key: "amenities",
        label: "المرافق",
        value: amenities.join(" · "),
      });
    }
  }

  if (listing.electronicsSpecs) {
    for (const [key, value] of Object.entries(listing.electronicsSpecs)) {
      if (!hasValue(value)) continue;
      entries.push({
        key,
        label: getCategoryFieldLabel(
          listing.categoryId === "mobiles" ? "mobiles" : "electronics",
          key,
        ),
        value: String(value),
      });
    }
  }

  return entries;
}

/** User-entered categorySpecs — strict, no fallbacks */
function getUserSpecEntries(listing: Listing): SpecEntry[] {
  if (!listing.categorySpecs) {
    return [];
  }

  const fieldOrder = getCategoryFields(listing.categoryId).map((field) => field.key);
  const entries: SpecEntry[] = [];

  for (const key of fieldOrder) {
    if (key === "features") continue;
    const value = listing.categorySpecs[key];
    if (!hasValue(value)) continue;
    entries.push({
      key,
      label: getCategoryFieldLabel(listing.categoryId, key),
      value: formatValue(key, value as string | number | boolean),
    });
  }

  for (const [key, value] of Object.entries(listing.categorySpecs)) {
    if (fieldOrder.includes(key) || key === "features") continue;
    if (!hasValue(value)) continue;
    entries.push({
      key,
      label: getCategoryFieldLabel(listing.categoryId, key),
      value: formatValue(key, value as string | number | boolean),
    });
  }

  return entries;
}

export function getListingSpecEntries(listing: Listing): SpecEntry[] {
  if (isUserCreatedListing(listing)) {
    return getUserSpecEntries(listing);
  }
  return getMockSpecEntries(listing);
}

export function getListingFeatureItems(listing: Listing): string[] {
  if (listing.features?.length) {
    return listing.features;
  }
  if (listing.categorySpecs?.features) {
    const raw = listing.categorySpecs.features;
    if (typeof raw === "string") {
      return raw.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export function listingMatchesQuery(listing: Listing, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const specValues = listing.categorySpecs
    ? Object.entries(listing.categorySpecs)
        .filter(([key]) => key !== "features")
        .map(([, value]) => String(value))
    : [];

  const haystack = [
    listing.title,
    listing.titleEnglish,
    listing.description,
    listing.descriptionEnglish,
    listing.city,
    listing.emirate,
    listing.area,
    listing.subcategory,
    listing.seller.name,
    ...specValues,
    ...(listing.features ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

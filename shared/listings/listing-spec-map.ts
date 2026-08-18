import type { Listing } from "@/types";
import {
  CAR_BRANDS,
  ELECTRONICS_BRANDS,
  MOBILE_BRANDS,
} from "@/shared/constants/product-brands";

const BRAND_ALIASES: Record<string, string[]> = {
  Toyota: ["تويوتا"],
  Nissan: ["نيسان"],
  Honda: ["هوندا"],
  Lexus: ["لكزس"],
  "Mercedes-Benz": ["مرسيدس", "mercedes", "amg"],
  BMW: ["بي إم دبليو", "بي ام دبليو"],
  Audi: ["أودي", "اودي"],
  Porsche: ["بورش"],
  "Land Rover": ["لاند روفر"],
  "Range Rover": ["رينج روفر"],
  Suzuki: ["سوزوكي"],
  Hyundai: ["هيونداي"],
  Kia: ["كيا"],
  Tesla: ["تسلا"],
  Chevrolet: ["شيفروليه"],
  Ford: ["فورد"],
  Mitsubishi: ["ميتسوبيشي"],
  Volkswagen: ["فولكس", "فولكسفاجن"],
  Apple: ["آبل", "ابل"],
  Samsung: ["سامسونج"],
  Sony: ["سوني"],
};

const MODEL_ALIASES: Record<string, string[]> = {
  Patrol: ["باترول"],
  "Land Cruiser": ["لاند كروزر"],
  Camry: ["كامري"],
  Corolla: ["كورولا"],
  "G-Class": ["g63", "g-class", "جي كلاس"],
  "Model Y": ["موديل y", "model y"],
  X7: ["x7"],
  Ciaz: ["سياز"],
  "MacBook Pro": ["ماك بوك"],
  iPhone: ["آيفون", "ايفون"],
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[-_]/g, " ");
}

function textBlob(listing: Listing): string {
  return [
    listing.title,
    listing.titleEnglish,
    listing.subcategory,
    listing.description,
    listing.descriptionEnglish,
  ]
    .filter(Boolean)
    .join(" ");
}

function detectFromList(
  haystack: string,
  values: readonly string[],
): string | undefined {
  const hay = normalize(haystack);
  let best: { value: string; length: number } | undefined;
  for (const value of values) {
    const aliases = [value, ...(BRAND_ALIASES[value] ?? []), ...(MODEL_ALIASES[value] ?? [])];
    for (const alias of aliases) {
      if (hay.includes(normalize(alias)) && alias.length >= (best?.length ?? 0)) {
        best = { value, length: alias.length };
      }
    }
  }
  return best?.value;
}

export function getListingSpecMap(listing: Listing): Record<string, string> {
  const map: Record<string, string> = {};

  if (listing.categorySpecs) {
    for (const [key, value] of Object.entries(listing.categorySpecs)) {
      if (value === null || value === undefined || value === "") continue;
      map[key] = String(value);
    }
  }

  if (listing.carSpecs) {
    if (listing.carSpecs.fuel) map.fuelType ??= listing.carSpecs.fuel;
    if (listing.carSpecs.transmission) map.transmission ??= listing.carSpecs.transmission;
    if (listing.carSpecs.regionalSpecs) map.regionalSpecs ??= listing.carSpecs.regionalSpecs;
    if (listing.carSpecs.mileage) map.mileage ??= listing.carSpecs.mileage;
    if (listing.carSpecs.warranty) map.warranty ??= listing.carSpecs.warranty;
    if (listing.carSpecs.accidentHistory) {
      map.accidentHistory ??= listing.carSpecs.accidentHistory;
    }
    if (listing.carSpecs.serviceHistory) {
      map.serviceHistory ??= listing.carSpecs.serviceHistory;
    }
  }

  if (listing.realEstateSpecs) {
    map.bedrooms ??= String(listing.realEstateSpecs.bedrooms);
    map.bathrooms ??= String(listing.realEstateSpecs.bathrooms);
    map.area ??= String(listing.realEstateSpecs.areaSqft);
    map.furnished ??= listing.realEstateSpecs.furnished;
    map.developer ??= listing.realEstateSpecs.developer;
    map.community ??= listing.realEstateSpecs.community;
    map.parking ??= String(listing.realEstateSpecs.parking);
  }

  if (listing.electronicsSpecs) {
    map.storage ??= listing.electronicsSpecs.storage;
    map.color ??= listing.electronicsSpecs.color;
    map.warranty ??= listing.electronicsSpecs.warranty;
  }

  if (listing.condition) map.condition ??= listing.condition;
  if (listing.city) map.city ??= listing.city;
  if (listing.emirate) map.emirate ??= listing.emirate;
  if (listing.subcategory) map.subcategory ??= listing.subcategory;

  const blob = textBlob(listing);
  if (!map.year) {
    const year = blob.match(/\b((?:19|20)\d{2})\b/);
    if (year) map.year = year[1];
  }

  const brandPool =
    listing.categoryId === "cars"
      ? CAR_BRANDS
      : listing.categoryId === "mobiles"
        ? MOBILE_BRANDS
        : listing.categoryId === "electronics"
          ? ELECTRONICS_BRANDS
          : [];
  if (!map.brand && brandPool.length > 0) {
    const detected = detectFromList(blob, brandPool);
    if (detected) map.brand = detected;
  }

  if (!map.model) {
    const detected = detectFromList(blob, Object.keys(MODEL_ALIASES));
    if (detected) map.model = detected;
  }

  return map;
}

function valuesCompatible(actual: string, expected: string): boolean {
  const left = normalize(actual);
  const right = normalize(expected);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const aliases = [
    ...(BRAND_ALIASES[expected] ?? []),
    ...(MODEL_ALIASES[expected] ?? []),
    ...(BRAND_ALIASES[actual] ?? []),
    ...(MODEL_ALIASES[actual] ?? []),
  ];
  return aliases.some((alias) => left.includes(normalize(alias)));
}

function parseNumeric(value: string): number | undefined {
  const match = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const numberValue = Number(match[0]);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function listingMatchesSpecs(
  listing: Listing,
  specs: Record<string, string> | undefined,
): boolean {
  if (!specs) return true;
  const map = getListingSpecMap(listing);
  const blob = textBlob(listing);

  for (const [key, raw] of Object.entries(specs)) {
    const expected = raw.trim();
    if (!expected) continue;

    if (key === "yearMin" || key === "yearMax") {
      const year = parseNumeric(map.year ?? "");
      const bound = Number(expected);
      if (!year || !Number.isFinite(bound)) return false;
      if (key === "yearMin" && year < bound) return false;
      if (key === "yearMax" && year > bound) return false;
      continue;
    }

    if (key.endsWith("Min") || key.endsWith("+") || expected.endsWith("+")) {
      const actual = parseNumeric(map[key.replace(/\+|Min$/g, "")] ?? map[key] ?? "");
      const bound = parseNumeric(expected);
      if (actual == null || bound == null || actual < bound) return false;
      continue;
    }

    if (key === "bedrooms" || key === "bathrooms") {
      const actual = parseNumeric(map[key] ?? "");
      if (expected.endsWith("+")) {
        const bound = parseNumeric(expected);
        if (actual == null || bound == null || actual < bound) return false;
        continue;
      }
      const bound = parseNumeric(expected);
      if (actual == null || bound == null || actual !== bound) return false;
      continue;
    }

    if (key === "year") {
      const actual = parseNumeric(map.year ?? "");
      const bound = Number(expected);
      if (!actual || actual !== bound) return false;
      continue;
    }

    const actual = map[key];
    if (actual && valuesCompatible(actual, expected)) continue;
    if (valuesCompatible(blob, expected)) continue;
    return false;
  }

  return true;
}

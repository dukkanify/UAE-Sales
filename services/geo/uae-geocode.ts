import { cities } from "@/shared/constants/locations";

export type ReverseGeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  emirate: string;
  city: string;
  area: string;
  inUae: boolean;
  source: "nominatim" | "nearest-emirate";
};

const UAE_BOUNDS = {
  minLat: 22.5,
  maxLat: 26.7,
  minLng: 51.4,
  maxLng: 56.6,
};

const EMIRATE_CENTERS: { name: string; lat: number; lng: number }[] = [
  { name: "دبي", lat: 25.2048, lng: 55.2708 },
  { name: "أبوظبي", lat: 24.4539, lng: 54.3773 },
  { name: "الشارقة", lat: 25.3463, lng: 55.4209 },
  { name: "عجمان", lat: 25.4052, lng: 55.5136 },
  { name: "أم القيوين", lat: 25.5647, lng: 55.5552 },
  { name: "رأس الخيمة", lat: 25.7895, lng: 55.9432 },
  { name: "الفجيرة", lat: 25.1288, lng: 56.3269 },
];

const EMIRATE_ALIASES: Record<string, string> = {
  "ae-du": "دبي",
  dubai: "دبي",
  "emirate of dubai": "دبي",
  دبي: "دبي",
  "ae-az": "أبوظبي",
  "abu dhabi": "أبوظبي",
  "emirate of abu dhabi": "أبوظبي",
  أبوظبي: "أبوظبي",
  "أبو ظبي": "أبوظبي",
  "ae-sh": "الشارقة",
  sharjah: "الشارقة",
  "emirate of sharjah": "الشارقة",
  الشارقة: "الشارقة",
  "ae-aj": "عجمان",
  ajman: "عجمان",
  "emirate of ajman": "عجمان",
  عجمان: "عجمان",
  "ae-uq": "أم القيوين",
  "umm al quwain": "أم القيوين",
  "umm al-quwain": "أم القيوين",
  "umm al qaywayn": "أم القيوين",
  "emirate of umm al quwain": "أم القيوين",
  "أم القيوين": "أم القيوين",
  "ae-rk": "رأس الخيمة",
  "ras al khaimah": "رأس الخيمة",
  "ras al-khaimah": "رأس الخيمة",
  "emirate of ras al khaimah": "رأس الخيمة",
  "رأس الخيمة": "رأس الخيمة",
  "ae-fu": "الفجيرة",
  fujairah: "الفجيرة",
  "emirate of fujairah": "الفجيرة",
  الفجيرة: "الفجيرة",
};

const VALID_EMIRATES = new Set(cities.map((city) => city.name));

type NominatimAddress = {
  country_code?: string;
  state?: string;
  ISO3166_2_lvl4?: string;
  "ISO3166-2-lvl1"?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  suburb?: string;
  neighbourhood?: string;
  neighborhood?: string;
  quarter?: string;
  city_district?: string;
  road?: string;
  pedestrian?: string;
  house_number?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export function isInUaeBounds(lat: number, lng: number): boolean {
  return (
    lat >= UAE_BOUNDS.minLat &&
    lat <= UAE_BOUNDS.maxLat &&
    lng >= UAE_BOUNDS.minLng &&
    lng <= UAE_BOUNDS.maxLng
  );
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/ـ/g, "").replace(/\s+/g, " ");
}

export function resolveUaeEmirate(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const mapped = EMIRATE_ALIASES[normalizeKey(candidate)];
    if (mapped && VALID_EMIRATES.has(mapped)) return mapped;
    if (VALID_EMIRATES.has(candidate.trim())) return candidate.trim();
  }
  return "";
}

export function nearestUaeEmirate(lat: number, lng: number): string {
  let best = "";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const emirate of EMIRATE_CENTERS) {
    const distance = haversineKm(lat, lng, emirate.lat, emirate.lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = emirate.name;
    }
  }
  return best;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function firstText(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function buildFormattedAddress(
  displayName: string | undefined,
  address: NominatimAddress | undefined,
  emirate: string,
): string {
  if (displayName?.trim()) return displayName.trim();
  const parts = [
    firstText(address?.house_number, address?.road, address?.pedestrian),
    firstText(address?.suburb, address?.neighbourhood, address?.neighborhood, address?.quarter),
    firstText(address?.city, address?.town, address?.village),
    emirate,
  ].filter(Boolean);
  return parts.join("، ");
}

export function mapNominatimToDelivery(
  lat: number,
  lng: number,
  payload: NominatimResponse,
): ReverseGeocodeResult {
  const address = payload.address ?? {};
  const iso = address["ISO3166-2-lvl1"] ?? address.ISO3166_2_lvl4;
  const inUae =
    address.country_code?.toLowerCase() === "ae" || isInUaeBounds(lat, lng);
  const emirate = resolveUaeEmirate(
    iso,
    address.state,
    address.city,
    address.town,
    address.county,
  );
  const area = firstText(
    address.suburb,
    address.neighbourhood,
    address.neighborhood,
    address.quarter,
    address.city_district,
    address.village,
    address.road,
  );
  const city = firstText(address.city, address.town, address.municipality, emirate);
  const resolvedEmirate = emirate || (inUae ? nearestUaeEmirate(lat, lng) : "");

  return {
    latitude: lat,
    longitude: lng,
    formattedAddress: buildFormattedAddress(payload.display_name, address, resolvedEmirate),
    emirate: resolvedEmirate,
    city: city || resolvedEmirate,
    area: area || city || resolvedEmirate,
    inUae: inUae && Boolean(resolvedEmirate),
    source: "nominatim",
  };
}

export function fallbackFromCoordinates(lat: number, lng: number): ReverseGeocodeResult {
  const inUae = isInUaeBounds(lat, lng);
  const emirate = inUae ? nearestUaeEmirate(lat, lng) : "";
  const formattedAddress = emirate
    ? `${emirate} (${lat.toFixed(5)}, ${lng.toFixed(5)})`
    : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  return {
    latitude: lat,
    longitude: lng,
    formattedAddress,
    emirate,
    city: emirate,
    area: emirate,
    inUae,
    source: "nearest-emirate",
  };
}

export async function reverseGeocodeUae(
  lat: number,
  lng: number,
  language: "ar" | "en" = "ar",
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": language === "en" ? "en,ar" : "ar,en",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "SooqnaCheckout/1.0 (delivery reverse-geocode; https://sooqna.ae)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return fallbackFromCoordinates(lat, lng);
  }

  const payload = (await response.json()) as NominatimResponse;
  const mapped = mapNominatimToDelivery(lat, lng, payload);
  if (!mapped.formattedAddress) {
    return { ...fallbackFromCoordinates(lat, lng), source: mapped.source };
  }
  return mapped;
}

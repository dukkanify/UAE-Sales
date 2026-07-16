export type DemoMapPoint = {
  lat: number;
  lng: number;
  label: string;
};

/** Approximate neighborhood centers for demo map embeds (not exact pin accuracy). */
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "دبي مارينا": { lat: 25.0805, lng: 55.1403 },
  البرشاء: { lat: 25.1124, lng: 55.2003 },
  "جزيرة ياس": { lat: 24.4959, lng: 54.6042 },
  "داون تاون دبي": { lat: 25.1972, lng: 55.2744 },
  "الخليج التجاري": { lat: 25.1851, lng: 55.2784 },
  "نخلة جميرا": { lat: 25.1124, lng: 55.139 },
  "المرابع العربية": { lat: 25.1153, lng: 55.252 },
  "قرية جميرا الدائرية": { lat: 25.045, lng: 55.206 },
  "جزيرة الريم": { lat: 24.4945, lng: 54.407 },
  المجاز: { lat: 25.328, lng: 55.385 },
  "شاطئ الراحة": { lat: 24.456, lng: 54.322 },
  النهضة: { lat: 25.34, lng: 55.4 },
  "مدينة خليفة": { lat: 24.42, lng: 54.575 },
  "قرية الحمراء": { lat: 25.697, lng: 55.778 },
  مويلح: { lat: 25.31, lng: 55.46 },
  النعيمية: { lat: 25.405, lng: 55.51 },
  "مدينة الفجيرة": { lat: 25.1288, lng: 56.3269 },
};

const EMIRATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  دبي: { lat: 25.2048, lng: 55.2708 },
  أبوظبي: { lat: 24.4539, lng: 54.3773 },
  الشارقة: { lat: 25.3463, lng: 55.4209 },
  "رأس الخيمة": { lat: 25.7895, lng: 55.9432 },
  عجمان: { lat: 25.4052, lng: 55.5136 },
  الفجيرة: { lat: 25.1288, lng: 56.3269 },
  "أم القيوين": { lat: 25.5647, lng: 55.5552 },
};

const UAE_FALLBACK = { lat: 25.2048, lng: 55.2708 };

function buildLocationLabel(area?: string, emirate?: string, city?: string) {
  if (area && (emirate || city) && area !== emirate && area !== city) {
    return `${area}، ${emirate ?? city}`;
  }
  return area || emirate || city || "الإمارات العربية المتحدة";
}

export function resolveDemoMapPoint(input: {
  area?: string;
  emirate?: string;
  city?: string;
}): DemoMapPoint {
  const { area, emirate, city } = input;
  const coords =
    (area && AREA_COORDINATES[area]) ||
    (emirate && EMIRATE_COORDINATES[emirate]) ||
    (city && (AREA_COORDINATES[city] || EMIRATE_COORDINATES[city])) ||
    UAE_FALLBACK;

  return {
    ...coords,
    label: buildLocationLabel(area, emirate, city),
  };
}

/** ~neighborhood zoom for OSM export/embed.html */
export function buildOsmEmbedUrl(point: DemoMapPoint, delta = 0.018) {
  const { lat, lng } = point;
  const bbox = [
    lng - delta,
    lat - delta * 0.7,
    lng + delta,
    lat + delta * 0.7,
  ].join(",");

  const params = new URLSearchParams({
    bbox,
    layer: "mapnik",
    marker: `${lat},${lng}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export function buildGoogleMapsUrl(point: DemoMapPoint) {
  const query = encodeURIComponent(`${point.label}, الإمارات العربية المتحدة`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildOsmBrowseUrl(point: DemoMapPoint) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=15/${point.lat}/${point.lng}`;
}

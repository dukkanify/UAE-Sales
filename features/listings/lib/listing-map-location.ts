export type ListingMapPoint = {
  lat: number;
  lng: number;
  label: string;
};

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
  المنصورة: { lat: 25.3575, lng: 55.409 },
  ديرة: { lat: 25.2713, lng: 55.331 },
  القصباء: { lat: 25.3216, lng: 55.3765 },
  الخالدية: { lat: 24.4663, lng: 54.3531 },
  الراشدية: { lat: 25.392, lng: 55.478 },
  جميرا: { lat: 25.2065, lng: 55.2487 },
  الرقة: { lat: 25.2668, lng: 55.3265 },
  السطوة: { lat: 25.2282, lng: 55.2734 },
  الكرامة: { lat: 25.2434, lng: 55.304 },
  "مدينة زايد": { lat: 23.652, lng: 53.704 },
  "مدينة الشارقة للجامعات": { lat: 25.2865, lng: 55.478 },
  قدفع: { lat: 25.166, lng: 56.354 },
  السعديات: { lat: 24.541, lng: 54.434 },
  الرمس: { lat: 25.879, lng: 56.023 },
  الروضة: { lat: 25.394, lng: 55.47 },
  "منطقة المزارع": { lat: 25.145, lng: 56.29 },
  مردف: { lat: 25.219, lng: 55.42 },
  المنامة: { lat: 25.325, lng: 55.586 },
  الخان: { lat: 25.339, lng: 55.388 },
  النخيل: { lat: 25.789, lng: 55.943 },
  المرحلة: { lat: 25.123, lng: 56.334 },
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

export function resolveListingMapPoint(input: {
  area?: string;
  emirate?: string;
  city?: string;
}): ListingMapPoint {
  const { area, emirate, city } = input;
  const coords =
    (area && AREA_COORDINATES[area]) ||
    (city && AREA_COORDINATES[city]) ||
    (emirate && EMIRATE_COORDINATES[emirate]) ||
    (city && EMIRATE_COORDINATES[city]) ||
    UAE_FALLBACK;

  return {
    ...coords,
    label: buildLocationLabel(area, emirate, city),
  };
}

export function buildOsmEmbedUrl(point: ListingMapPoint, delta = 0.014) {
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

export function buildGoogleMapsUrl(point: ListingMapPoint) {
  const query = encodeURIComponent(`${point.lat},${point.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildGoogleDirectionsUrl(point: ListingMapPoint) {
  const destination = encodeURIComponent(`${point.lat},${point.lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function buildOsmBrowseUrl(point: ListingMapPoint) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}`;
}

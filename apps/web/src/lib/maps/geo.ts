import type { KuwaitGovernorate } from "@aldlalz/database";

export type LatLng = { lat: number; lng: number };

/** Default radius for nearby listing queries (km) */
export const NEARBY_DEFAULT_RADIUS_KM = 5;

/** Earth radius in km */
const R = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Bounding box for a radius (km) — used to pre-filter SQL before haversine sort */
export function boundingBox(
  center: LatLng,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111;
  const lngDelta =
    radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180) || 1);
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export function formatDistanceKm(km: number, locale: string): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return locale === "ar" ? `${m} م` : `${m} m`;
  }
  const rounded = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return locale === "ar" ? `${rounded} كم` : `${rounded} km`;
}

export const GOVERNORATE_CENTERS: Record<KuwaitGovernorate, LatLng> = {
  CAPITAL: { lat: 29.3759, lng: 47.9774 },
  HAWALLI: { lat: 29.333, lng: 48.029 },
  FARWANIYA: { lat: 29.273, lng: 47.958 },
  AHMADI: { lat: 29.076, lng: 48.083 },
  JAHRA: { lat: 29.337, lng: 47.658 },
  MUBARAK_AL_KABEER: { lat: 29.213, lng: 48.06 },
};

/** Approximate centers for common Kuwait areas (Arabic name key) */
export const AREA_CENTERS: Record<string, LatLng> = {
  السالمية: { lat: 29.334, lng: 48.076 },
  حولي: { lat: 29.332, lng: 48.029 },
  الشويخ: { lat: 29.349, lng: 47.961 },
  شرق: { lat: 29.378, lng: 47.993 },
  الخالدية: { lat: 29.364, lng: 47.968 },
  الفروانية: { lat: 29.273, lng: 47.958 },
  "جليب الشيوخ": { lat: 29.294, lng: 47.934 },
  الأحمدي: { lat: 29.076, lng: 48.132 },
  الفحيحيل: { lat: 29.082, lng: 48.133 },
  الجهراء: { lat: 29.337, lng: 47.658 },
  "صباح السالم": { lat: 29.257, lng: 48.071 },
};

export function resolveMapCenter(
  governorate: KuwaitGovernorate,
  areaAr?: string | null
): LatLng {
  if (areaAr && AREA_CENTERS[areaAr]) return AREA_CENTERS[areaAr];
  return GOVERNORATE_CENTERS[governorate] ?? GOVERNORATE_CENTERS.CAPITAL;
}

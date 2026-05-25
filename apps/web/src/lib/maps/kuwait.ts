export const KUWAIT_CENTER = { lat: 29.3759, lng: 47.9774 };

export const KUWAIT_MAP_BOUNDS = {
  north: 30.1,
  south: 28.45,
  east: 48.6,
  west: 46.5,
};

export function isValidKuwaitCoordinate(lat: number, lng: number) {
  return (
    lat >= KUWAIT_MAP_BOUNDS.south &&
    lat <= KUWAIT_MAP_BOUNDS.north &&
    lng >= KUWAIT_MAP_BOUNDS.west &&
    lng <= KUWAIT_MAP_BOUNDS.east
  );
}

export function parseCoordinate(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function googleMapsConfigured() {
  return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

export function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}

export function buildStaticMapUrl(lat: number, lng: number) {
  const key = getGoogleMapsApiKey();
  if (!key) return null;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "14",
    size: "640x360",
    scale: "2",
    maptype: "roadmap",
    markers: `color:red|${lat},${lng}`,
    key,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export function buildGoogleMapsLink(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

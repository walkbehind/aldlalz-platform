import {
  prisma,
  type Listing,
  type Prisma,
} from "@aldlalz/database";
import {
  boundingBox,
  haversineKm,
  NEARBY_DEFAULT_RADIUS_KM,
  type LatLng,
} from "@/lib/maps/geo";
import { mapToCardData, type ListingCardData } from "@/lib/listings/queries";

export type NearbyListing = ListingCardData & {
  distanceKm: number;
};

const nearbySelect = {
  id: true,
  titleAr: true,
  titleEn: true,
  listingType: true,
  propertyType: true,
  priceKwd: true,
  governorate: true,
  area: true,
  bedrooms: true,
  bathrooms: true,
  sizeM2: true,
  createdAt: true,
  isFeatured: true,
  latitude: true,
  longitude: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 3,
    select: {
      id: true,
      url: true,
      storagePath: true,
      isCover: true,
      width: true,
      height: true,
      sortOrder: true,
    },
  },
} as const;

type NearbyRow = Prisma.ListingGetPayload<{ select: typeof nearbySelect }>;

function rowToNearby(row: NearbyRow, origin: LatLng): NearbyListing | null {
  if (row.latitude == null || row.longitude == null) return null;
  const lat = Number(row.latitude.toString());
  const lng = Number(row.longitude.toString());
  const distanceKm = haversineKm(origin, { lat, lng });
  const card = mapToCardData(row);
  return { ...card, distanceKm };
}

/**
 * Geo-based nearby listings (Phase 4 prep).
 * Uses bounding-box SQL filter + haversine sort in application code.
 */
export async function getNearbyListings(
  origin: LatLng,
  options?: {
    excludeId?: string;
    radiusKm?: number;
    limit?: number;
  }
): Promise<NearbyListing[]> {
  const radiusKm = options?.radiusKm ?? NEARBY_DEFAULT_RADIUS_KM;
  const limit = options?.limit ?? 4;
  const box = boundingBox(origin, radiusKm);

  const rows = await prisma.listing.findMany({
    where: {
      isDraft: false,
      adminStatus: "APPROVED",
      latitude: { not: null, gte: box.minLat, lte: box.maxLat },
      longitude: { not: null, gte: box.minLng, lte: box.maxLng },
      ...(options?.excludeId ? { id: { not: options.excludeId } } : {}),
    },
    select: nearbySelect,
    take: 50,
  });

  return rows
    .map((row) => rowToNearby(row, origin))
    .filter((r): r is NearbyListing => r != null && r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export async function getNearbyListingsForListing(listing: {
  id: string;
  latitude: Listing["latitude"];
  longitude: Listing["longitude"];
}) {
  if (listing.latitude == null || listing.longitude == null) return [];
  return getNearbyListings(
    {
      lat: Number(listing.latitude.toString()),
      lng: Number(listing.longitude.toString()),
    },
    { excludeId: listing.id }
  );
}

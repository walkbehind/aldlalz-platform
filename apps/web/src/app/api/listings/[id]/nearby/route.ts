import { getPublicListingById } from "@/lib/listings/queries";
import { getNearbyListingsForListing } from "@/lib/listings/nearby";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const listing = await getPublicListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (listing.latitude == null || listing.longitude == null) {
    return NextResponse.json({ listings: [], radiusKm: 5 });
  }

  const nearby = await getNearbyListingsForListing(listing);

  return NextResponse.json({
    listings: nearby.map(({ distanceKm, ...card }) => ({
      ...card,
      distanceKm,
    })),
    radiusKm: 5,
  });
}

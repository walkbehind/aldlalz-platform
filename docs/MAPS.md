# Google Maps & location (Phase 4)

## Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → enable **Maps JavaScript API** and **Maps Static API**
2. Create an API key and restrict it to your domains in production
3. Add to `.env.local`, `apps/web/.env.local`, and **Vercel**:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"
```

4. Apply geo migration:

```bash
npm run db:migrate:deploy
```

## Features

| Feature | Where |
|---------|--------|
| Governorate → Area dropdowns | Listing form (dashboard) |
| Map pin (click + drag) | Listing form map picker |
| Use my location | Map picker (mobile-friendly) |
| Coordinates in DB | `listings.latitude`, `listings.longitude`, `addressLine` |
| Public map | Listing detail page |
| Static map first | Detail page loads Static API image; tap for interactive map (saves JS API cost) |
| Nearby listings | Detail page + `GET /api/listings/[id]/nearby` |

## Nearby listings (preparation)

- `apps/web/src/lib/maps/geo.ts` — haversine distance, bounding box
- `apps/web/src/lib/listings/nearby.ts` — `getNearbyListings()`, default 5 km radius
- Migration `004_listing_geo_index` — partial index on `(latitude, longitude)`

## Health checks

- DB: `GET /api/health/db` → `phase4Ready: true`
- Storage: `GET /api/health/storage`

## RTL

Map sections use `dir="rtl"` when locale is Arabic. Google Maps loads with `language="ar"` and `region="KW"`.

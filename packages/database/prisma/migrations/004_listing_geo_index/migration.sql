-- Phase 4: geo index for nearby listing queries
CREATE INDEX IF NOT EXISTS "listings_geo_idx"
ON "listings" ("latitude", "longitude")
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

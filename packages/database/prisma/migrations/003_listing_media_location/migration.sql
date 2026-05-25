-- =============================================================================
-- 003_listing_media_location — images, coordinates, featured flag
-- =============================================================================

ALTER TABLE "listings"
  ADD COLUMN "latitude" DECIMAL(10, 7),
  ADD COLUMN "longitude" DECIMAL(10, 7),
  ADD COLUMN "addressLine" TEXT,
  ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "listings_isFeatured_idx" ON "listings" ("isFeatured");

CREATE TABLE "listing_images" (
  "id"          TEXT NOT NULL,
  "listingId"   TEXT NOT NULL,
  "url"         TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "isCover"     BOOLEAN NOT NULL DEFAULT false,
  "width"       INTEGER,
  "height"      INTEGER,
  "sizeBytes"   INTEGER,
  "mimeType"    TEXT NOT NULL DEFAULT 'image/webp',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "listing_images_listingId_idx" ON "listing_images" ("listingId");
CREATE INDEX "listing_images_listingId_sortOrder_idx" ON "listing_images" ("listingId", "sortOrder");
CREATE INDEX "listing_images_listingId_isCover_idx" ON "listing_images" ("listingId", "isCover");

ALTER TABLE "listing_images"
  ADD CONSTRAINT "listing_images_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "listings" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

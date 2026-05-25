-- =============================================================================
-- 002_listings_core — Kuwait listing fields, indexes, and constraints
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 002.1 — New enums
-- -----------------------------------------------------------------------------

CREATE TYPE "PropertyType" AS ENUM (
  'APARTMENT',
  'VILLA',
  'HOUSE',
  'DUPLEX',
  'CHALET',
  'OFFICE',
  'SHOP',
  'WAREHOUSE',
  'LAND',
  'BUILDING',
  'OTHER'
);

CREATE TYPE "KuwaitGovernorate" AS ENUM (
  'CAPITAL',
  'HAWALLI',
  'FARWANIYA',
  'AHMADI',
  'JAHRA',
  'MUBARAK_AL_KABEER'
);

-- -----------------------------------------------------------------------------
-- 002.2 — Listing columns
-- -----------------------------------------------------------------------------

ALTER TABLE "listings"
  ADD COLUMN "propertyType" "PropertyType" NOT NULL DEFAULT 'APARTMENT',
  ADD COLUMN "governorate" "KuwaitGovernorate" NOT NULL DEFAULT 'CAPITAL',
  ADD COLUMN "area" TEXT NOT NULL DEFAULT 'العاصمة',
  ADD COLUMN "paciNumber" TEXT,
  ADD COLUMN "bedrooms" INTEGER,
  ADD COLUMN "bathrooms" INTEGER,
  ADD COLUMN "parking" INTEGER,
  ADD COLUMN "sizeM2" DECIMAL(10, 2),
  ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "rejectionReason" TEXT;

UPDATE "listings" SET "priceKwd" = 0 WHERE "priceKwd" IS NULL;

ALTER TABLE "listings"
  ALTER COLUMN "priceKwd" SET NOT NULL,
  ALTER COLUMN "priceKwd" SET DEFAULT 0;

-- -----------------------------------------------------------------------------
-- 002.3 — Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX "listings_propertyType_idx" ON "listings" ("propertyType");
CREATE INDEX "listings_governorate_idx" ON "listings" ("governorate");
CREATE INDEX "listings_area_idx" ON "listings" ("area");
CREATE INDEX "listings_adminStatus_idx" ON "listings" ("adminStatus");
CREATE INDEX "listings_isDraft_idx" ON "listings" ("isDraft");
CREATE INDEX "listings_priceKwd_idx" ON "listings" ("priceKwd");
CREATE INDEX "listings_bedrooms_idx" ON "listings" ("bedrooms");

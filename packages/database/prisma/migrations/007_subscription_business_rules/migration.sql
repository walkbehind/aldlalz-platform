-- Business-rule adjustments: free-tier prep, plan limits, featured monetization fields

-- Scalable plan limits (does not alter active subscription snapshots)
UPDATE "subscription_plans"
SET "maxListings" = 50, "updatedAt" = NOW()
WHERE "slug" = 'semi-annual';

UPDATE "subscription_plans"
SET "maxListings" = 150, "updatedAt" = NOW()
WHERE "slug" = 'annual';

-- Placement types for featured promotions (separate from subscription)
CREATE TYPE "FeaturePlacementType" AS ENUM ('FEATURED_BADGE', 'SEARCH_TOP', 'HOME_PAGE');

ALTER TABLE "featured_requests"
  ADD COLUMN IF NOT EXISTS "placementType" "FeaturePlacementType" NOT NULL DEFAULT 'FEATURED_BADGE';

ALTER TABLE "featured_requests"
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(12, 3);

ALTER TABLE "featured_requests"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'KWD';

-- Rename duration column when present (006 used featureType)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'featured_requests' AND column_name = 'featureType'
  ) THEN
    ALTER TABLE "featured_requests" RENAME COLUMN "featureType" TO "durationType";
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "featured_requests_placementType_idx"
  ON "featured_requests"("placementType");

-- Soft-launch subscription model: SubscriptionPlan, FeaturedRequest, migrate from packages

-- CreateEnum
CREATE TYPE "FeatureDurationType" AS ENUM ('DAYS_3', 'DAYS_7', 'DAYS_30');

-- CreateEnum
CREATE TYPE "FeaturedRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'PAYMENT_CONFIRMED', 'ACTIVE', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- Rename packages → subscription_plans and extend
ALTER TABLE "packages" RENAME TO "subscription_plans";

ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "includedFeatureCredits" INTEGER NOT NULL DEFAULT 0;

-- Drop legacy column if present
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "target";

-- Backfill slug from nameEn for any existing rows
UPDATE "subscription_plans"
SET "slug" = LOWER(REPLACE(COALESCE("nameEn", "nameAr"), ' ', '-'))
WHERE "slug" IS NULL;

UPDATE "subscription_plans" SET "slug" = 'plan-' || "id" WHERE "slug" IS NULL OR "slug" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_slug_key" ON "subscription_plans"("slug");

-- user_subscriptions: packageId → planId
ALTER TABLE "user_subscriptions" RENAME COLUMN "packageId" TO "planId";

ALTER TABLE "user_subscriptions" DROP CONSTRAINT IF EXISTS "user_subscriptions_packageId_fkey";

ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Featured requests
CREATE TABLE "featured_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "featureType" "FeatureDurationType" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" "FeaturedRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "paymentNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "featured_requests_userId_idx" ON "featured_requests"("userId");
CREATE INDEX "featured_requests_listingId_idx" ON "featured_requests"("listingId");
CREATE INDEX "featured_requests_status_idx" ON "featured_requests"("status");
CREATE INDEX "featured_requests_expiresAt_idx" ON "featured_requests"("expiresAt");

ALTER TABLE "featured_requests" ADD CONSTRAINT "featured_requests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "featured_requests" ADD CONSTRAINT "featured_requests_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed soft-launch plans (idempotent by slug)
INSERT INTO "subscription_plans" (
  "id", "slug", "nameAr", "nameEn", "descriptionAr", "descriptionEn",
  "tier", "durationDays", "maxListings", "includedFeatureCredits", "priceKwd",
  "isActive", "createdAt", "updatedAt"
)
VALUES
  (
    'plan_weekly',
    'weekly',
    'أسبوعي',
    'Weekly',
    'مناسب للأفراد لتجربة المنصة',
    'Suitable for individuals testing the platform',
    1, 7, 3, 0, 3.000,
    true, NOW(), NOW()
  ),
  (
    'plan_monthly',
    'monthly',
    'شهري',
    'Monthly',
    'مناسب لملاك العقارات والدلالين بدوام جزئي',
    'Suitable for property owners and part-time brokers',
    2, 30, 10, 0, 8.000,
    true, NOW(), NOW()
  ),
  (
    'plan_semi_annual',
    'semi-annual',
    'نصف سنوي',
    'Semi-Annual',
    'مناسب للدلالين النشطين — رصيد تمييز واحد شهرياً',
    'Suitable for active brokers — 1 featured credit per month',
    3, 182, 35, 1, 40.000,
    true, NOW(), NOW()
  ),
  (
    'plan_annual',
    'annual',
    'سنوي',
    'Annual',
    'مناسب للمكاتب والدلالين المحترفين — رصيدان تمييز شهرياً',
    'Suitable for offices and professional brokers — 2 featured credits per month',
    4, 365, 75, 2, 70.000,
    true, NOW(), NOW()
  )
ON CONFLICT ("slug") DO UPDATE SET
  "nameAr" = EXCLUDED."nameAr",
  "nameEn" = EXCLUDED."nameEn",
  "descriptionAr" = EXCLUDED."descriptionAr",
  "descriptionEn" = EXCLUDED."descriptionEn",
  "tier" = EXCLUDED."tier",
  "durationDays" = EXCLUDED."durationDays",
  "maxListings" = EXCLUDED."maxListings",
  "includedFeatureCredits" = EXCLUDED."includedFeatureCredits",
  "priceKwd" = EXCLUDED."priceKwd",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

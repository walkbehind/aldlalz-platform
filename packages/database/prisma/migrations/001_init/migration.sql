-- =============================================================================
-- 001_init — Aldlalz Phase 1 foundation
-- =============================================================================
-- Creates Auth.js tables, core domain tables, enums, indexes, and foreign keys.
-- Next migration: 002_<description>
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 001.1 — Extensions & schema
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS "public";

-- -----------------------------------------------------------------------------
-- 001.2 — Enums
-- -----------------------------------------------------------------------------

CREATE TYPE "UserRole" AS ENUM (
  'USER',
  'OWNER',
  'BROKER',
  'OFFICE',
  'ADMIN',
  'SUPERADMIN'
);

CREATE TYPE "ListingType" AS ENUM (
  'SALE',
  'RENT',
  'BOOKING',
  'PROJECT',
  'SPORT',
  'COURSE',
  'ENTERTAINMENT'
);

CREATE TYPE "ListingStatus" AS ENUM (
  'AVAILABLE',
  'SOLD',
  'RENTED',
  'BOOKED',
  'NEGOTIATING',
  'UNDER_REVIEW',
  'REJECTED'
);

CREATE TYPE "AdminStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE "PackageTarget" AS ENUM (
  'USER',
  'OFFICE'
);

-- -----------------------------------------------------------------------------
-- 001.3 — Tables: Auth (Auth.js)
-- -----------------------------------------------------------------------------

CREATE TABLE "users" (
  "id"             TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "emailVerified"  TIMESTAMP(3),
  "passwordHash"   TEXT,
  "image"          TEXT,
  "nameAr"         TEXT,
  "nameEn"         TEXT,
  "phone"          TEXT,
  "role"           "UserRole" NOT NULL DEFAULT 'USER',
  "langPreference" TEXT NOT NULL DEFAULT 'ar',
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,

  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id"           TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL,
  "expires"    TIMESTAMP(3) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 001.4 — Tables: Domain
-- -----------------------------------------------------------------------------

CREATE TABLE "listings" (
  "id"             TEXT NOT NULL,
  "ownerId"        TEXT NOT NULL,
  "listingType"    "ListingType" NOT NULL,
  "titleAr"        TEXT NOT NULL,
  "titleEn"        TEXT,
  "descriptionAr"  TEXT,
  "descriptionEn"  TEXT,
  "priceKwd"       DECIMAL(12, 3),
  "listingStatus"  "ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
  "adminStatus"    "AdminStatus" NOT NULL DEFAULT 'PENDING',
  "viewCount"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packages" (
  "id"             TEXT NOT NULL,
  "nameAr"         TEXT NOT NULL,
  "nameEn"         TEXT,
  "descriptionAr"  TEXT,
  "descriptionEn"  TEXT,
  "target"         "PackageTarget" NOT NULL DEFAULT 'USER',
  "tier"           INTEGER NOT NULL DEFAULT 1,
  "maxListings"    INTEGER NOT NULL DEFAULT 5,
  "durationDays"   INTEGER NOT NULL DEFAULT 30,
  "priceKwd"       DECIMAL(12, 3) NOT NULL,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 001.5 — Indexes
-- -----------------------------------------------------------------------------

CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users" ("phone");

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key"
  ON "accounts" ("provider", "providerAccountId");

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions" ("sessionToken");

CREATE UNIQUE INDEX "verification_tokens_token_key"
  ON "verification_tokens" ("token");

CREATE UNIQUE INDEX "verification_tokens_identifier_token_key"
  ON "verification_tokens" ("identifier", "token");

CREATE INDEX "listings_ownerId_idx" ON "listings" ("ownerId");
CREATE INDEX "listings_listingType_idx" ON "listings" ("listingType");
CREATE INDEX "listings_listingStatus_idx" ON "listings" ("listingStatus");

-- -----------------------------------------------------------------------------
-- 001.6 — Foreign keys
-- -----------------------------------------------------------------------------

ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "listings"
  ADD CONSTRAINT "listings_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

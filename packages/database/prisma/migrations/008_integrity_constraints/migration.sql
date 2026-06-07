-- Concurrency guards: one ACTIVE subscription per user, one open featured request per listing

CREATE UNIQUE INDEX IF NOT EXISTS "user_subscriptions_one_active_per_user_idx"
  ON "user_subscriptions" ("userId")
  WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS "featured_requests_one_open_per_listing_idx"
  ON "featured_requests" ("listingId")
  WHERE "status" IN ('PENDING', 'APPROVED', 'PAYMENT_CONFIRMED', 'ACTIVE');

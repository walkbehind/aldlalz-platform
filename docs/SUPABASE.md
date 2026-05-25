# Supabase + Prisma

## 1. Connection strings (required)

In **Supabase Dashboard** → **Project Settings** → **Database** → **Connection string**:

| Variable | Supabase mode | Port |
|----------|---------------|------|
| `DIRECT_URL` | **Session pooler** | 5432 |
| `DATABASE_URL` | **Transaction pooler** | 6543 (`?pgbouncer=true&connection_limit=1`) |

Username format: `postgres.[project-ref]`  
Example region for this project: `aws-1-ap-northeast-1.pooler.supabase.com`

Add both to:

- `.env.local` (repo root)
- `apps/web/.env.local`
- **Vercel** → Environment Variables (Production + Preview)

> **Vercel / serverless:** `DATABASE_URL` must include `pgbouncer=true` and `connection_limit=1` on the transaction pooler (port 6543). Without this, you may see `prepared statement "sX" already exists` (Postgres 42P05). The app auto-adds these params on Vercel, but set them explicitly in Vercel env vars too.
>
> If you only have the legacy direct URL (`db.*.supabase.co`), run:
> ```bash
> npm run db:sync-env
> ```
> Then confirm the database password matches Supabase → **Reset database password** if auth fails.

## 2. Apply schema

```bash
npm install
npm run db:generate
npm run db:migrate:deploy   # local (uses .env.local)
npm run db:seed
npm run db:verify
```

On **Vercel**, migrations run automatically during build via `npm run build:vercel` when `DATABASE_URL` and `DIRECT_URL` are set in the project.

## 3. Verify connection

**Local:**

```bash
npm run db:verify
```

**Production (after deploy):**

```
GET https://your-app.vercel.app/api/health/db
```

Expected: `{ "ok": true, "database": "postgres", "tables": [...] }`

## 4. Manual fallback (SQL Editor)

If CLI cannot connect locally, paste and run:

`packages/database/prisma/migrations/001_init/migration.sql`

Then mark migration applied:

```bash
npx dotenv -e .env.local -- prisma migrate resolve --schema=packages/database/prisma/schema.prisma --applied 001_init
```

## 6. Error P3005 (database not empty)

If deploy fails with **P3005** but tables already exist (e.g. you ran SQL manually):

```bash
npm run db:migrate:deploy   # will fail with P3005
npx dotenv -e .env.local -- prisma migrate resolve \
  --schema=packages/database/prisma/schema.prisma \
  --applied 001_init
npm run db:migrate:deploy   # should say "No pending migrations"
```

Then **Redeploy** on Vercel.

## 5. Tables

- `users`, `accounts`, `sessions`, `verification_tokens`
- `listings`, `listing_images`, `packages`
- Enums: `UserRole`, `ListingType`, `ListingStatus`, `AdminStatus`, `PackageTarget`, `PropertyType`, `KuwaitGovernorate`

## 6. Storage (Phase 3 — listing photos)

1. **Supabase Dashboard** → **Storage** → **New bucket**
   - Name: `listing-images`
   - **Public bucket**: enabled (public read for approved listing photos)
2. Add to `.env.local`, `apps/web/.env.local`, and **Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose to client)
3. Optional RLS: uploads go through the Next.js API using the service role; public read via bucket policy.

## 7. Google Maps (Phase 3)

1. Enable **Maps JavaScript API** in Google Cloud Console.
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to env files and Vercel.
3. Restrict the key to your domains in production.

## 8. Apply migration 003

```bash
npm run db:migrate:deploy
```

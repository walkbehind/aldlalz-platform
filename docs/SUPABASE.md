# Supabase + Prisma

## 1. Connection strings (required)

In **Supabase Dashboard** → **Project Settings** → **Database** → **Connection string**:

| Variable | Supabase mode | Port |
|----------|---------------|------|
| `DIRECT_URL` | **Session pooler** | 5432 |
| `DATABASE_URL` | **Transaction pooler** | 6543 (`?pgbouncer=true`) |

Username format: `postgres.[project-ref]`  
Example region for this project: `aws-1-ap-northeast-1.pooler.supabase.com`

Add both to:

- `.env.local` (repo root)
- `apps/web/.env.local`
- **Vercel** → Environment Variables (Production + Preview)

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

`packages/database/prisma/migrations/20250522120000_init/migration.sql`

Then mark migration applied:

```bash
npm run db:migrate:deploy
# or: npx prisma migrate resolve --applied 20250522120000_init --schema=packages/database/prisma/schema.prisma
```

## 5. Tables

- `users`, `accounts`, `sessions`, `verification_tokens`
- `listings`, `packages`
- Enums: `UserRole`, `ListingType`, `ListingStatus`, `AdminStatus`, `PackageTarget`

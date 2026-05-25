# Prisma migrations — Aldlalz

Migrations use **sequential numbering** for clarity:

```
migrations/
├── 001_init/           # Phase 1 foundation (auth + listings + packages)
├── 002_<name>/         # Next change
├── 003_<name>/
└── migration_lock.toml
```

## Naming convention

| Folder | Meaning |
|--------|---------|
| `001_init` | Initial schema |
| `002_add_wallet` | Example: wallet tables |
| `003_add_kyc` | Example: KYC module |

Use **three-digit prefix** + **snake_case description**.

## Create a new migration

```bash
# 1. Edit schema.prisma, then:
npm run db:migrate -- --name add_wallet

# 2. Prisma creates a timestamp folder — rename it to the next number:
#    e.g. 20250523120000_add_wallet  →  002_add_wallet

# 3. Commit and push; Vercel runs migrate deploy on deploy.
```

## Apply locally

```bash
npm run db:migrate:deploy
npm run db:verify
```

## Manual SQL (Supabase SQL Editor)

If automated deploy fails, run the migration file directly:

`001_init/migration.sql`

Then mark as applied:

```bash
npx dotenv -e .env.local -- prisma migrate resolve \
  --schema=packages/database/prisma/schema.prisma \
  --applied 001_init
```

## Migration log

| # | Folder | Description |
|---|--------|-------------|
| 001 | `001_init` | Auth.js tables, listings, packages, enums |

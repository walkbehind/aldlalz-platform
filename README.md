# Aldlalz | الدلالز

Modern real estate platform for Kuwait — sale, rent, booking, entertainment, and investment listings with Arabic-first UX.

**Status:** Phase 1 foundation (scaffold, auth structure, i18n, placeholder pages). Business logic ships in Phase 2.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | [Next.js 15](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [PostgreSQL](https://www.postgresql.org) + [Prisma](https://www.prisma.io) |
| Auth | [Auth.js](https://authjs.dev) (NextAuth v5) — credentials provider |
| i18n | [next-intl](https://next-intl.dev) — Arabic (default, RTL) & English (LTR) |
| Storage | Cloudflare R2 / S3 (Phase 2 — placeholder in `apps/web/src/lib/storage.ts`) |
| Deploy | [Vercel](https://vercel.com) (monorepo) |

---

## Repository structure

```
aldlalz/
├── apps/web/                 # Next.js application (deploy root on Vercel)
│   ├── messages/             # ar.json, en.json
│   ├── public/               # Static assets, PWA manifest
│   └── src/
│       ├── app/[locale]/     # Localized routes
│       ├── components/       # UI + layout + auth
│       ├── i18n/             # Routing & navigation
│       └── lib/              # auth, storage helpers
├── packages/database/        # Prisma schema & client
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── .env.example              # Template only — copy locally, never commit secrets
├── apps/web/vercel.json      # Vercel monorepo install/build overrides
└── package.json              # npm workspaces
```

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** 14+ (local, Docker, or hosted e.g. Neon / Supabase / Vercel Postgres)

---

## Local development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd aldlalz
npm install
```

### 2. Environment variables

Copy the example file — **never commit** `.env` or `.env.local`:

```bash
cp .env.example .env
cp .env.example apps/web/.env.local
```

Edit both files with your values (see table below).

### 3. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/ar`.

**Seed admin (after `db:seed`):**

| Field | Default |
|-------|---------|
| Email | `admin@aldlalz.com` |
| Password | `Admin123!` |
| Admin URL | `/ar/admin` |

---

## Environment variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for Auth.js sessions. Generate: `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Canonical app URL (e.g. `http://localhost:3000` or `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL (same as production domain in deploy) |
| `SEED_ADMIN_EMAIL` | No | Seed script admin email (default `admin@aldlalz.com`) |
| `SEED_ADMIN_PASSWORD` | No | Seed script admin password (default `Admin123!`) |
| `S3_ENDPOINT` | No | Phase 2 — R2/S3 endpoint |
| `S3_REGION` | No | Phase 2 — e.g. `auto` for R2 |
| `S3_BUCKET` | No | Phase 2 — media bucket |
| `S3_ACCESS_KEY_ID` | No | Phase 2 |
| `S3_SECRET_ACCESS_KEY` | No | Phase 2 |
| `S3_PUBLIC_URL` | No | Phase 2 — CDN/public base URL |

> **Security:** Only `.env.example` belongs in git. All real `.env*` files are gitignored.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Prisma generate + production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:migrate` | Create migration (production workflows) |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:seed` | Seed admin user + sample packages |

---

## Routes (Phase 1)

| Path | Description |
|------|-------------|
| `/ar`, `/en` | Home |
| `/[locale]/listings` | Listings (placeholder data) |
| `/[locale]/listings/[id]` | Listing detail |
| `/[locale]/packages` | Packages |
| `/[locale]/login`, `/register` | Auth |
| `/[locale]/dashboard` | User dashboard (authenticated) |
| `/[locale]/admin` | Admin (`ADMIN` / `SUPERADMIN`) |

---

## Deploy on Vercel

This repo is a **npm workspaces monorepo**. Recommended Vercel setup:

### Option A — Root directory `apps/web` (recommended)

1. Import the GitHub repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Override commands (monorepo installs from repo root):
   - **Install Command:** `cd ../.. && npm install`
   - **Build Command:** `cd ../.. && npm run build`
4. Add environment variables in Vercel (Production + Preview):
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` → `https://<your-domain>`
   - `NEXT_PUBLIC_APP_URL` → same as `AUTH_URL`
5. Use **Vercel Postgres**, **Neon**, or **Supabase** for `DATABASE_URL`.
6. After first deploy, run migrations/seed against production DB as needed (`db:push` or `db:migrate` + `db:seed` from your machine or CI).

`apps/web/vercel.json` documents the install/build overrides for this layout.

### Post-deploy checklist

- [ ] `AUTH_URL` matches production domain exactly
- [ ] Database reachable from Vercel (SSL connection string if required)
- [ ] `npm run build` passes locally before pushing
- [ ] No `.env` files in git (`git check-ignore -v .env`)

---

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code; deploy from here |

Feature branches: `feature/<name>` → PR → `main`.

---

## Phase 2 roadmap

- Listings CRUD + admin approval
- Media upload (R2/S3)
- Wallet, packages checkout, KNET payments
- KYC, reviews, notifications
- Full ERD tables (bookings, transactions, charity, ranks)
- PWA icons + service worker

---

## License

Proprietary — Aldlalz. All rights reserved unless stated otherwise.

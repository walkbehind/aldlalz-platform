/**
 * Normalize DATABASE_URL for Supabase PgBouncer + Prisma on serverless (Vercel).
 * Fixes: prepared statement "sX" already exists (Postgres 42P05)
 */
export function getPooledDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);

    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }

    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    );
    if (isServerless && !url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }

    return url.toString();
  } catch {
    return raw;
  }
}

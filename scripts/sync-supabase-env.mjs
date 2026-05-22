/**
 * Sync .env.local with Supabase Session + Transaction pooler URLs.
 * Parses password from direct db.*.supabase.co DATABASE_URL.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const envPath = path.join(ROOT, ".env.local");
const webEnvPath = path.join(ROOT, "apps/web/.env.local");

const content = fs.readFileSync(envPath, "utf8");

const directMatch = content.match(
  /DATABASE_URL="postgresql:\/\/postgres:([^@]+)@db\.([^.]+)\.supabase\.co:\d+\/postgres/
);

const poolerMatch = content.match(
  /DATABASE_URL="postgresql:\/\/postgres\.([^:]+):([^@]+)@([^:]+):(\d+)\/postgres/
);

let password;
let ref;
let region = process.env.SUPABASE_REGION ?? "ap-northeast-1";
let poolerHost = `aws-1-${region}.pooler.supabase.com`;

if (directMatch) {
  password = directMatch[1].split("?")[0];
  ref = directMatch[2];
} else if (poolerMatch) {
  ref = poolerMatch[1];
  password = poolerMatch[2];
  poolerHost = poolerMatch[3];
  const regionMatch = poolerHost.match(/aws-\d+-(.+)\.pooler/);
  if (regionMatch) region = regionMatch[1];
} else {
  console.error("Could not parse DATABASE_URL in .env.local");
  process.exit(1);
}

const directUrl = `postgresql://postgres.${ref}:${password}@${poolerHost}:5432/postgres`;
const databaseUrl = `postgresql://postgres.${ref}:${password}@${poolerHost}:6543/postgres?pgbouncer=true`;

const preserved = content
  .split(/\r?\n/)
  .filter(
    (line) =>
      line.trim() &&
      !line.startsWith("DATABASE_URL=") &&
      !line.startsWith("DIRECT_URL=")
  );

const next = [
  ...preserved,
  `DATABASE_URL="${databaseUrl}"`,
  `DIRECT_URL="${directUrl}"`,
  "",
].join("\n");

fs.writeFileSync(envPath, next);
fs.writeFileSync(webEnvPath, next);
console.log(`Synced Supabase pooler URLs (${ref}, ${region})`);

import fs from "node:fs";
import pg from "pg";

const content = fs.readFileSync(".env.local", "utf8");
const m = content.match(/postgresql:\/\/postgres:([^@]+)@db\.([^.]+)\.supabase/);
if (!m) {
  console.error("Expected postgres:pass@db.ref.supabase in .env.local");
  process.exit(1);
}
const password = decodeURIComponent(m[1]);
const ref = m[2];
const enc = encodeURIComponent(password);

const candidates = [
  // Supabase pooler on db host (newer)
  ["db-6543-tx", `postgresql://postgres.${ref}:${enc}@db.${ref}.supabase.co:6543/postgres`],
  ["db-5432-session", `postgresql://postgres.${ref}:${enc}@db.${ref}.supabase.co:5432/postgres`],
  ["db-6543-postgres-user", `postgresql://postgres:${enc}@db.${ref}.supabase.co:6543/postgres`],
];

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-central-2", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
  "ca-central-1", "sa-east-1",
];

for (const prefix of ["aws-0", "aws-1"]) {
  for (const region of regions) {
    const host = `${prefix}-${region}.pooler.supabase.com`;
    candidates.push(
      [`${prefix}-${region}-5432`, `postgresql://postgres.${ref}:${enc}@${host}:5432/postgres`],
      [`${prefix}-${region}-6543`, `postgresql://postgres.${ref}:${enc}@${host}:6543/postgres`],
    );
  }
}

let winner = null;

for (const [label, cs] of candidates) {
  const client = new pg.Client({
    connectionString: cs,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  });
  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    console.log("OK", label);
    if (!winner) winner = { label, cs };
  } catch (e) {
    const msg = e.message.split("\n")[0];
    if (!msg.includes("ENOTFOUND") && !msg.includes("ETIMEDOUT")) {
      console.log("FAIL", label, msg.slice(0, 80));
    }
  }
}

if (winner) {
  const direct = winner.cs.includes(":6543")
    ? winner.cs.replace(":6543/", ":5432/").replace(/\?.*$/, "")
    : winner.cs.replace(/\?.*$/, "");
  const pooled = winner.cs.includes(":5432")
    ? winner.cs.replace(":5432/", ":6543/") + (winner.cs.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true")
    : winner.cs + (winner.cs.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true");

  console.log("\n--- Use in .env.local ---");
  console.log(`DIRECT_URL="${direct}"`);
  console.log(`DATABASE_URL="${pooled}"`);
} else {
  console.error("\nNo connection worked. Use URIs from Supabase Dashboard → Database.");
  process.exit(1);
}

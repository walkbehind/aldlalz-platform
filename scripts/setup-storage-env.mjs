/**
 * Add Supabase Storage env vars derived from DATABASE_URL project ref.
 * You still need to paste anon + service_role keys from Supabase Dashboard → Settings → API.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const envPaths = [
  path.join(ROOT, ".env.local"),
  path.join(ROOT, "apps/web/.env.local"),
];

function parseProjectRef(content) {
  const pooler = content.match(
    /postgres\.([a-z0-9]+):[^@]+@[^/]+\/postgres/
  );
  if (pooler) return pooler[1];

  const direct = content.match(/@db\.([a-z0-9]+)\.supabase\.co/);
  if (direct) return direct[1];

  return null;
}

function upsertEnv(content, key, value) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    return content.replace(re, line);
  }
  return content.trimEnd() + `\n${line}\n`;
}

function hasKey(content, key) {
  const m = content.match(new RegExp(`^${key}="([^"]*)"`, "m"));
  return m ? m[1].trim().length > 0 : false;
}

let sourcePath = envPaths.find((p) => fs.existsSync(p));
if (!sourcePath) {
  console.error("No .env.local found. Create apps/web/.env.local with DATABASE_URL first.");
  process.exit(1);
}

const source = fs.readFileSync(sourcePath, "utf8");
const ref = parseProjectRef(source);
if (!ref) {
  console.error("Could not parse Supabase project ref from DATABASE_URL.");
  process.exit(1);
}

const supabaseUrl = `https://${ref}.supabase.co`;

for (const envPath of envPaths) {
  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : source;

  content = upsertEnv(content, "NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);

  if (!hasKey(content, "NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    content = upsertEnv(content, "NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  }
  if (!hasKey(content, "SUPABASE_SERVICE_ROLE_KEY")) {
    content = upsertEnv(content, "SUPABASE_SERVICE_ROLE_KEY", "");
  }

  fs.writeFileSync(envPath, content);
  console.log(`Updated ${path.relative(ROOT, envPath)}`);
}

console.log("");
console.log("Supabase project URL:", supabaseUrl);
console.log("");
console.log("Next steps:");
console.log("1. Supabase Dashboard → Settings → API");
console.log("   - anon public     → NEXT_PUBLIC_SUPABASE_ANON_KEY");
console.log("   - service_role    → SUPABASE_SERVICE_ROLE_KEY (keep secret)");
console.log("2. Storage → New bucket → name: listing-images → Public bucket: ON");
console.log("3. Paste keys into apps/web/.env.local (and Vercel env vars for production)");
console.log("4. Restart dev server: npm run dev");
console.log("5. Verify: npm run storage:check");

const hasAnon = hasKey(fs.readFileSync(sourcePath, "utf8"), "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const hasService = hasKey(
  fs.readFileSync(sourcePath, "utf8"),
  "SUPABASE_SERVICE_ROLE_KEY"
);

if (!hasAnon || !hasService) {
  console.log("");
  console.log("⚠ Keys still empty — uploads will not work until you add them.");
  process.exit(0);
}

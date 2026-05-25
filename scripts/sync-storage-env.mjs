/**
 * Copy Supabase Storage vars from repo root .env.local → apps/web/.env.local
 * (Next.js loads env from apps/web when running the web app.)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const rootEnv = path.join(ROOT, ".env.local");
const webEnv = path.join(ROOT, "apps/web/.env.local");

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function readEnv(content) {
  const map = new Map();
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function upsert(content, key, value) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  return re.test(content) ? content.replace(re, line) : content.trimEnd() + `\n${line}\n`;
}

if (!fs.existsSync(rootEnv)) {
  console.error("Missing .env.local at repo root");
  process.exit(1);
}

const root = readEnv(fs.readFileSync(rootEnv, "utf8"));
let web = fs.existsSync(webEnv) ? fs.readFileSync(webEnv, "utf8") : "";

for (const key of KEYS) {
  const value = root.get(key);
  if (value != null && value.length > 0) {
    web = upsert(web, key, value);
    console.log(`Synced ${key} → apps/web/.env.local`);
  }
}

fs.writeFileSync(webEnv, web);
console.log("Done. Restart dev server: npm run dev");

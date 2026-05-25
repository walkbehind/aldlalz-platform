/**
 * Verify Supabase Storage configuration and listing-images bucket access.
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), "apps/web/.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing apps/web/.env.local");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");
function get(key) {
  const m = content.match(new RegExp(`^${key}="([^"]*)"`, "m"));
  return m?.[1]?.trim() ?? "";
}

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const anonKey = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const bucket = "listing-images";

console.log("Storage configuration:");
console.log("  NEXT_PUBLIC_SUPABASE_URL:", url || "(missing)");
console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", anonKey ? "(set)" : "(missing)");
console.log("  SUPABASE_SERVICE_ROLE_KEY:", serviceKey ? "(set)" : "(missing)");

if (!url || !serviceKey) {
  console.error("\n❌ Storage not configured. Run: npm run storage:setup");
  console.error("   Then add API keys from Supabase Dashboard → Settings → API");
  process.exit(1);
}

const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
  headers: {
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
  },
});

if (res.status === 404) {
  console.error(`\n❌ Bucket "${bucket}" not found.`);
  console.error("   Create it: Supabase Dashboard → Storage → New bucket");
  console.error("   Name: listing-images | Public bucket: enabled");
  process.exit(1);
}

if (!res.ok) {
  const text = await res.text();
  console.error(`\n❌ Storage API error (${res.status}):`, text.slice(0, 200));
  process.exit(1);
}

const data = await res.json();
console.log(`\n✅ Bucket "${bucket}" exists (public: ${data.public ?? "unknown"})`);
console.log("   Restart dev server if you just added env vars.");

/**
 * Test Supabase Storage upload with current env (dry run — lists bucket only).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.join(process.cwd(), "apps/web/.env.local");
const content = fs.readFileSync(envPath, "utf8");
function get(key) {
  const m = content.match(new RegExp(`^${key}="([^"]*)"`, "m"));
  return m?.[1] ?? "";
}

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = get("SUPABASE_SERVICE_ROLE_KEY");
const bucket = "listing-images";

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
console.log("listBuckets:", listErr?.message ?? `ok (${buckets?.length ?? 0} buckets)`);

const { data: files, error: listFilesErr } = await supabase.storage
  .from(bucket)
  .list("", { limit: 1 });
console.log("list files:", listFilesErr?.message ?? `ok`);

const testPath = `_healthcheck/${Date.now()}.txt`;
const { error: uploadErr } = await supabase.storage
  .from(bucket)
  .upload(testPath, Buffer.from("ok"), { contentType: "text/plain", upsert: true });
console.log("test upload:", uploadErr?.message ?? "ok");

if (!uploadErr) {
  await supabase.storage.from(bucket).remove([testPath]);
  console.log("test cleanup: ok");
}

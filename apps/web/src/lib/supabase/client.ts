import { createClient } from "@supabase/supabase-js";

export const LISTING_IMAGES_BUCKET = "listing-images";
export const MAX_IMAGES_PER_LISTING = 20;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function isSupabaseStorageConfigured() {
  return !!(
    getSupabaseUrl() &&
    getSupabaseServiceRoleKey()
  );
}

export function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getPublicStorageUrl(storagePath: string) {
  const url = getSupabaseUrl();
  return `${url}/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/${storagePath}`;
}

export function buildListingImagePath(
  ownerId: string,
  listingId: string,
  fileName: string
) {
  return `${ownerId}/${listingId}/${fileName}`;
}

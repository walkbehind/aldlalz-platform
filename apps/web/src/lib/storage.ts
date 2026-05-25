import {
  isSupabaseStorageConfigured,
  LISTING_IMAGES_BUCKET,
  MAX_IMAGES_PER_LISTING,
  getPublicStorageUrl,
} from "@/lib/supabase/client";

export {
  LISTING_IMAGES_BUCKET,
  MAX_IMAGES_PER_LISTING,
  getPublicStorageUrl,
  isSupabaseStorageConfigured,
};

export function isStorageConfigured() {
  return isSupabaseStorageConfigured();
}

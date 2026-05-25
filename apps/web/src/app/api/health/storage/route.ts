import {
  createSupabaseAdminClient,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseStorageConfigured,
  LISTING_IMAGES_BUCKET,
} from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  const url = getSupabaseUrl();
  const hasServiceKey = !!getSupabaseServiceRoleKey();
  const configured = isSupabaseStorageConfigured();

  if (!configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      missing: [
        !url && "NEXT_PUBLIC_SUPABASE_URL",
        !hasServiceKey && "SUPABASE_SERVICE_ROLE_KEY",
      ].filter(Boolean),
      hint: "Supabase Dashboard → Settings → API. Also create public bucket listing-images.",
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.getBucket(
      LISTING_IMAGES_BUCKET
    );

    if (error || !data) {
      return NextResponse.json({
        ok: false,
        configured: true,
        bucket: LISTING_IMAGES_BUCKET,
        bucketExists: false,
        error: error?.message ?? "BUCKET_NOT_FOUND",
        hint: `Create bucket "${LISTING_IMAGES_BUCKET}" in Supabase Storage (public read).`,
      });
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      bucket: LISTING_IMAGES_BUCKET,
      bucketExists: true,
      public: data.public,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      configured: true,
      error: e instanceof Error ? e.message : "STORAGE_ERROR",
    });
  }
}

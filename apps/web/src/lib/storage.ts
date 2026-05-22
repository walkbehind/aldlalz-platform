/**
 * Cloudflare R2 / S3 storage — Phase 2 implementation.
 * Placeholder exports keep imports stable when media upload is added.
 */

export type StorageConfig = {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
};

export function getStorageConfig(): StorageConfig {
  return {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "auto",
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicUrl: process.env.S3_PUBLIC_URL,
  };
}

export function isStorageConfigured(): boolean {
  const c = getStorageConfig();
  return !!(c.bucket && c.accessKeyId && c.secretAccessKey);
}

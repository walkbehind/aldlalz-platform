"use client";

import { useEffect, useState } from "react";
import { ListingMediaUploader } from "@/components/listings/listing-media-uploader";
import type { ListingImageDto } from "@/lib/listings/images";

type StorageHealth = {
  ok?: boolean;
  configured?: boolean;
  bucketExists?: boolean;
  missing?: string[];
};

type Props = {
  listingId: string;
  initialImages: ListingImageDto[];
};

export function ListingMediaSection({ listingId, initialImages }: Props) {
  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/health/storage", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const data = (await res.json()) as StorageHealth;
        if (!cancelled) {
          setStorageConfigured(
            !!(data.ok && data.configured && data.bucketExists)
          );
        }
      } catch {
        if (!cancelled) setStorageConfigured(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (storageConfigured === null) {
    return (
      <p className="text-sm text-text-muted" aria-live="polite">
        …
      </p>
    );
  }

  return (
    <ListingMediaUploader
      listingId={listingId}
      initialImages={initialImages}
      storageConfigured={storageConfigured}
    />
  );
}

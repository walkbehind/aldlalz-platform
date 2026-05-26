"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, Spinner } from "@/components/ui/feedback";
import type { ListingImageDto } from "@/lib/listings/images";
import { MAX_IMAGES_PER_LISTING } from "@/lib/supabase/client";

type Props = {
  listingId: string;
  initialImages: ListingImageDto[];
  storageConfigured: boolean;
};

const fetchOpts = { credentials: "same-origin" as const };

const MEDIA_ERROR_KEYS = [
  "UPLOAD_FAILED",
  "MAX_IMAGES",
  "INVALID_TYPE",
  "FILE_TOO_LARGE",
  "STORAGE_NOT_CONFIGURED",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "DELETE_FAILED",
  "REORDER_FAILED",
  "COVER_FAILED",
] as const;

type MediaErrorKey = (typeof MEDIA_ERROR_KEYS)[number];

function mediaErrorMessage(
  t: ReturnType<typeof useTranslations<"dashboard.listings.media">>,
  code: string | undefined,
  fallback: MediaErrorKey
) {
  const key = MEDIA_ERROR_KEYS.includes(code as MediaErrorKey)
    ? (code as MediaErrorKey)
    : fallback;
  return t(`errors.${key}`);
}

export function ListingMediaUploader({
  listingId,
  initialImages,
  storageConfigured,
}: Props) {
  const t = useTranslations("dashboard.listings.media");
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setUploading(true);
      setError(null);

      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      try {
        const res = await fetch(`/api/listings/${listingId}/images`, {
          method: "POST",
          body: formData,
          ...fetchOpts,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(mediaErrorMessage(t, data.error, "UPLOAD_FAILED"));
          return;
        }
        setImages((prev) => [...prev, ...(data.images as ListingImageDto[])]);
      } catch {
        setError(t("errors.UPLOAD_FAILED"));
      } finally {
        setUploading(false);
      }
    },
    [listingId, t]
  );

  async function onDelete(imageId: string) {
    if (!confirm(t("deleteConfirm"))) return;
    setError(null);
    const res = await fetch(`/api/listings/${listingId}/images/${imageId}`, {
      method: "DELETE",
      ...fetchOpts,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(mediaErrorMessage(t, data.error, "DELETE_FAILED"));
      return;
    }
    setImages((prev) => {
      const next = prev.filter((i) => i.id !== imageId);
      if (next.length > 0 && !next.some((i) => i.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  }

  async function onSetCover(imageId: string) {
    setError(null);
    const res = await fetch(`/api/listings/${listingId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cover", imageId }),
      ...fetchOpts,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(mediaErrorMessage(t, data.error, "COVER_FAILED"));
      return;
    }
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === imageId }))
    );
  }

  async function persistOrder(next: ListingImageDto[]) {
    const res = await fetch(`/api/listings/${listingId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        orderedIds: next.map((i) => i.id),
      }),
      ...fetchOpts,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(mediaErrorMessage(t, data.error, "REORDER_FAILED"));
    }
  }

  function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      void persistOrder(next);
      return next;
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      void uploadFiles(e.dataTransfer.files);
    }
  }

  if (!storageConfigured) {
    return (
      <Alert variant="warning">{t("storageNotConfigured")}</Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors touch-manipulation ${
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-border bg-surface-muted hover:border-brand-400"
        }`}
      >
        <p className="font-medium">{t("dropzoneTitle")}</p>
        <p className="mt-1 text-sm text-text-muted">{t("dropzoneHint")}</p>
        <p className="mt-2 text-xs text-text-muted">
          {t("count", { count: images.length, max: MAX_IMAGES_PER_LISTING })}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && (
        <p className="flex items-center gap-2 text-sm text-brand-600">
          <Spinner size="sm" />
          {t("uploading")}
        </p>
      )}
      {error && <Alert>{error}</Alert>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex != null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className={`group relative overflow-hidden rounded-lg border bg-surface ${
                image.isCover ? "ring-2 ring-brand-500" : "border-border"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.thumbUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              {image.isCover && (
                <span className="absolute start-2 top-2 rounded bg-brand-600 px-2 py-0.5 text-xs text-white">
                  {t("cover")}
                </span>
              )}
              {images.length > 1 && (
                <div className="absolute end-2 top-2 flex flex-col gap-0.5 sm:hidden">
                  <button
                    type="button"
                    disabled={index === 0}
                    className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-white disabled:opacity-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(index, index - 1);
                    }}
                    aria-label={t("moveEarlier")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    className="rounded bg-black/50 px-1.5 py-0.5 text-xs text-white disabled:opacity-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(index, index + 1);
                    }}
                    aria-label={t("moveLater")}
                  >
                    ↓
                  </button>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                {!image.isCover && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      void onSetCover(image.id);
                    }}
                  >
                    {t("setCover")}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDelete(image.id);
                  }}
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

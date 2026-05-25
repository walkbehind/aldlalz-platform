"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type GalleryImage = {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
};

type Props = {
  images: GalleryImage[];
  title: string;
};

export function ListingGallery({ images, title }: Props) {
  const t = useTranslations("listingDetail.gallery");
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const current = images[index];

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, go]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-surface-muted text-text-muted">
        {t("noImages")}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative aspect-[16/10] w-full">
          <button
            type="button"
            className="relative block h-full w-full cursor-zoom-in"
            onClick={() => setFullscreen(true)}
            aria-label={t("openFullscreen")}
          >
            <Image
              src={current.url}
              alt={title}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                aria-label={t("next")}
              >
                ›
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === index ? "border-brand-500" : "border-transparent"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute end-4 top-4 rounded-lg bg-white/10 px-3 py-2 text-white"
            onClick={() => setFullscreen(false)}
          >
            {t("close")}
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={current.url}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-4">
              <button
                type="button"
                className="rounded-full bg-white/20 px-4 py-2 text-white"
                onClick={() => go(-1)}
              >
                {t("prev")}
              </button>
              <button
                type="button"
                className="rounded-full bg-white/20 px-4 py-2 text-white"
                onClick={() => go(1)}
              >
                {t("next")}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

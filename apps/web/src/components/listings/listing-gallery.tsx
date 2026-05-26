"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type GalleryImage = {
  id: string;
  url: string;
  thumbUrl?: string;
  width?: number | null;
  height?: number | null;
};

type Props = {
  images: GalleryImage[];
  title: string;
};

const SWIPE_THRESHOLD = 48;

export function ListingGallery({ images, title }: Props) {
  const t = useTranslations("listingDetail.gallery");
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const current = images[index];

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length]
  );

  const onTouchStart = useCallback((clientX: number) => {
    touchStartX.current = clientX;
  }, []);

  const onTouchEnd = useCallback(
    (clientX: number) => {
      if (touchStartX.current == null) return;
      const delta = clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      go(delta > 0 ? -1 : 1);
    },
    [go]
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

  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => onTouchStart(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) =>
      onTouchEnd(e.changedTouches[0].clientX),
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative aspect-[16/10] w-full touch-pan-y" {...swipeHandlers}>
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
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
              className="object-cover"
            />
          </button>

          {images.length > 1 && (
            <span className="absolute bottom-3 end-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
              {t("counter", { current: index + 1, total: images.length })}
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white sm:start-3"
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl text-white sm:end-3"
                aria-label={t("next")}
              >
                ›
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3 pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative h-20 w-28 shrink-0 snap-start overflow-hidden rounded-lg border-2 sm:h-16 sm:w-24 ${
                  i === index ? "border-brand-500" : "border-transparent"
                }`}
              >
                <Image
                  src={img.thumbUrl ?? img.url}
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
          {...swipeHandlers}
        >
          <button
            type="button"
            className="absolute end-4 top-4 z-10 rounded-lg bg-white/10 px-3 py-2 text-white"
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
            <div className="absolute bottom-6 flex items-center gap-4">
              <button
                type="button"
                className="rounded-full bg-white/20 px-4 py-2 text-white"
                onClick={() => go(-1)}
              >
                {t("prev")}
              </button>
              <span className="text-sm text-white/80">
                {t("counter", { current: index + 1, total: images.length })}
              </span>
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

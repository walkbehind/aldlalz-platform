"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import {
  buildGoogleMapsLink,
  buildStaticMapUrl,
  getGoogleMapsApiKey,
  googleMapsConfigured,
} from "@/lib/maps/kuwait";

const InteractiveMap = dynamic(
  () =>
    import("@/components/listings/listing-map-interactive").then(
      (m) => m.ListingMapInteractive
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-56 items-center justify-center bg-surface-muted text-sm text-text-muted">
        …
      </div>
    ),
  }
);

type Props = {
  lat: number;
  lng: number;
  addressLine?: string | null;
};

export function ListingMapDisplay({ lat, lng, addressLine }: Props) {
  const t = useTranslations("listingDetail.map");
  const locale = useLocale();
  const [interactive, setInteractive] = useState(false);
  const staticUrl = buildStaticMapUrl(lat, lng);
  const apiKey = getGoogleMapsApiKey();

  if (!googleMapsConfigured()) {
    return (
      <div
        className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-text-muted"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {addressLine ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
      </div>
    );
  }

  return (
    <div className="space-y-2" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      {addressLine && (
        <p className="text-sm text-text-muted">{addressLine}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        {!interactive && staticUrl ? (
          <button
            type="button"
            className="relative block w-full touch-manipulation"
            onClick={() => setInteractive(true)}
            aria-label={t("tapToLoadMap")}
          >
            <Image
              src={staticUrl}
              alt={t("title")}
              width={640}
              height={360}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority={false}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-sm text-white">
              {t("tapToLoadMap")}
            </span>
          </button>
        ) : (
          <div className="h-56 sm:h-64 md:h-72">
            <InteractiveMap lat={lat} lng={lng} apiKey={apiKey} />
          </div>
        )}
      </div>

      <a
        href={buildGoogleMapsLink(lat, lng)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-brand-600 hover:underline"
      >
        {t("openInMaps")}
      </a>
    </div>
  );
}

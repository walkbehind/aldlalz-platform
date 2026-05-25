"use client";

import Image from "next/image";
import {
  APIProvider,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";
import {
  buildGoogleMapsLink,
  buildStaticMapUrl,
  getGoogleMapsApiKey,
  googleMapsConfigured,
} from "@/lib/maps/kuwait";

type Props = {
  lat: number;
  lng: number;
  addressLine?: string | null;
};

export function ListingMapDisplay({ lat, lng, addressLine }: Props) {
  const t = useTranslations("listingDetail.map");
  const apiKey = getGoogleMapsApiKey();
  const staticUrl = buildStaticMapUrl(lat, lng);

  if (!googleMapsConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-text-muted">
        {addressLine ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      {addressLine && (
        <p className="text-sm text-text-muted">{addressLine}</p>
      )}
      <div className="h-56 overflow-hidden rounded-xl border border-border md:h-72">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat, lng }}
            defaultZoom={15}
            gestureHandling="cooperative"
            disableDefaultUI
          >
            <Marker position={{ lat, lng }} />
          </Map>
        </APIProvider>
      </div>
      <a
        href={buildGoogleMapsLink(lat, lng)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-brand-600 hover:underline"
      >
        {t("openInMaps")}
      </a>
      {staticUrl && (
        <noscript>
          <Image
            src={staticUrl}
            alt={t("title")}
            width={640}
            height={360}
            className="mt-2 rounded-lg"
          />
        </noscript>
      )}
    </div>
  );
}

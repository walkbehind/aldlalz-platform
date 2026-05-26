"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, Marker, MapMouseEvent } from "@vis.gl/react-google-maps";
import type { KuwaitGovernorate } from "@aldlalz/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  KUWAIT_MAP_BOUNDS,
  isValidKuwaitCoordinate,
} from "@/lib/maps/kuwait";
import { GoogleMapsProvider } from "@/lib/maps/google-maps-provider";
import { resolveMapCenter } from "@/lib/maps/geo";

type Props = {
  apiKey: string;
  locale: string;
  governorate: KuwaitGovernorate;
  areaAr: string;
  labels: {
    title: string;
    hint: string;
    addressLine: string;
    latitude: string;
    longitude: string;
    useMyLocation: string;
    clearPin: string;
    locationDenied: string;
  };
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string | null;
};

export function ListingMapPicker({
  apiKey,
  locale,
  governorate,
  areaAr,
  labels,
  initialLat,
  initialLng,
  initialAddress,
}: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null
  );
  const [center, setCenter] = useState(() =>
    resolveMapCenter(governorate, areaAr || null)
  );
  const [zoom, setZoom] = useState(position ? 15 : 12);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const next = resolveMapCenter(governorate, areaAr || null);
    setCenter(next);
    if (!position) setZoom(areaAr ? 14 : 12);
  }, [governorate, areaAr, position]);

  const setPin = useCallback((lat: number, lng: number) => {
    if (!isValidKuwaitCoordinate(lat, lng)) return;
    setPosition({ lat, lng });
    setCenter({ lat, lng });
    setZoom(15);
    setLocationError(null);
  }, []);

  function onMapClick(e: MapMouseEvent) {
    const latLng = e.detail.latLng;
    if (!latLng) return;
    setPin(latLng.lat, latLng.lng);
  }

  function onMarkerDrag(e: google.maps.MapMouseEvent) {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat == null || lng == null) return;
    setPin(lat, lng);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocationError(labels.locationDenied);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  return (
    <div className="space-y-3" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{labels.title}</h3>
          <p className="text-sm text-text-muted">{labels.hint}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locating}
            onClick={useMyLocation}
            className="min-h-[44px] flex-1 sm:flex-none"
          >
            {labels.useMyLocation}
          </Button>
          {position && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPosition(null)}
              className="min-h-[44px] flex-1 sm:flex-none"
            >
              {labels.clearPin}
            </Button>
          )}
        </div>
      </div>

      <GoogleMapsProvider apiKey={apiKey}>
        <div className="h-64 overflow-hidden rounded-xl border border-border sm:h-72 md:h-80">
          <Map
            key={`${center.lat}-${center.lng}-${zoom}`}
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            onClick={onMapClick}
            restriction={{
              latLngBounds: KUWAIT_MAP_BOUNDS,
              strictBounds: true,
            }}
          >
            {position && (
              <Marker
                position={position}
                draggable
                onDragEnd={onMarkerDrag}
              />
            )}
          </Map>
        </div>
      </GoogleMapsProvider>

      {locationError && (
        <p className="text-sm text-amber-700">{locationError}</p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <Label htmlFor="addressLine">{labels.addressLine}</Label>
          <Input
            id="addressLine"
            name="addressLine"
            defaultValue={initialAddress ?? ""}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <Label htmlFor="latitude">{labels.latitude}</Label>
          <Input
            id="latitude"
            name="latitude"
            readOnly
            value={position?.lat ?? ""}
            dir="ltr"
          />
        </div>
        <div>
          <Label htmlFor="longitude">{labels.longitude}</Label>
          <Input
            id="longitude"
            name="longitude"
            readOnly
            value={position?.lng ?? ""}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

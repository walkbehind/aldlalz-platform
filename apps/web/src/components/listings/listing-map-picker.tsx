"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KUWAIT_CENTER,
  KUWAIT_MAP_BOUNDS,
} from "@/lib/maps/kuwait";

type Props = {
  apiKey: string;
  labels: {
    title: string;
    hint: string;
    addressLine: string;
    latitude: string;
    longitude: string;
  };
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string | null;
};

export function ListingMapPicker({
  apiKey,
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

  function onMapClick(e: MapMouseEvent) {
    const latLng = e.detail.latLng;
    if (!latLng) return;
    setPosition({ lat: latLng.lat, lng: latLng.lng });
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">{labels.title}</h3>
        <p className="text-sm text-text-muted">{labels.hint}</p>
      </div>

      <APIProvider apiKey={apiKey}>
        <div className="h-64 overflow-hidden rounded-xl border border-border md:h-80">
          <Map
            defaultCenter={
              position ?? { lat: KUWAIT_CENTER.lat, lng: KUWAIT_CENTER.lng }
            }
            defaultZoom={position ? 14 : 10}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={onMapClick}
            restriction={{
              latLngBounds: KUWAIT_MAP_BOUNDS,
              strictBounds: true,
            }}
          >
            {position && <Marker position={position} />}
          </Map>
        </div>
      </APIProvider>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <Label htmlFor="addressLine">{labels.addressLine}</Label>
          <Input
            id="addressLine"
            name="addressLine"
            defaultValue={initialAddress ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="latitude">{labels.latitude}</Label>
          <Input
            id="latitude"
            name="latitude"
            readOnly
            value={position?.lat ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="longitude">{labels.longitude}</Label>
          <Input
            id="longitude"
            name="longitude"
            readOnly
            value={position?.lng ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

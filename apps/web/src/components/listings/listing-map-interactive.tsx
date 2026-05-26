"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";
import { GoogleMapsProvider } from "@/lib/maps/google-maps-provider";

type Props = {
  lat: number;
  lng: number;
  apiKey: string;
};

export function ListingMapInteractive({ lat, lng, apiKey }: Props) {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat, lng }}
        defaultZoom={15}
        gestureHandling="greedy"
        disableDefaultUI
        fullscreenControl
        style={{ width: "100%", height: "100%" }}
      >
        <Marker position={{ lat, lng }} />
      </Map>
    </GoogleMapsProvider>
  );
}

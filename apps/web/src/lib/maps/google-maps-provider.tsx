"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

type Props = {
  apiKey: string;
  children: ReactNode;
};

/** Shared Google Maps API provider — mount once per map widget to avoid duplicate script loads */
export function GoogleMapsProvider({ apiKey, children }: Props) {
  return (
    <APIProvider apiKey={apiKey} libraries={[]} language="ar" region="KW">
      {children}
    </APIProvider>
  );
}

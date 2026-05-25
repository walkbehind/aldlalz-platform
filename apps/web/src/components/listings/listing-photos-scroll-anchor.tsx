"use client";

import { useEffect, useRef } from "react";

type Props = {
  active: boolean;
};

/** Scroll to the photos section when a draft was just created */
export function ListingPhotosScrollAnchor({ active }: Props) {
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    const el = document.getElementById("listing-photos");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active]);

  return null;
}

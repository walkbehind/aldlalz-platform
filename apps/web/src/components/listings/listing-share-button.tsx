"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

type Props = {
  title: string;
  url: string;
  shareLabel: string;
  copiedLabel: string;
};

export function ListingShareButton({
  title,
  url,
  shareLabel,
  copiedLabel,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
    >
      <Icon name={copied ? "check" : "share"} size={16} className={copied ? "text-success" : "text-brand-500"} />
      {copied ? copiedLabel : shareLabel}
    </button>
  );
}

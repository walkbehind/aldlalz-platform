"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingMediaSection } from "@/components/listings/listing-media-section";
import type { TranslationLabels } from "@/components/listings/listing-bilingual-fields";
import { createListingAction } from "@/lib/listings/actions";

type MapLabels = {
  title: string;
  hint: string;
  addressLine: string;
  latitude: string;
  longitude: string;
  useMyLocation: string;
  clearPin: string;
  locationDenied: string;
};

type Props = {
  locale: string;
  labels: Record<string, string>;
  translationLabels: TranslationLabels;
  submitLabel: string;
  mediaTitle: string;
  photosHint: string;
  photosAfterSave: string;
  continueEditing: string;
  mapsApiKey?: string;
  mapLabels?: MapLabels;
  mapsNotConfigured?: string;
};

export function NewListingFlow({
  locale,
  labels,
  translationLabels,
  submitLabel,
  mediaTitle,
  photosHint,
  photosAfterSave,
  continueEditing,
  mapsApiKey,
  mapLabels,
  mapsNotConfigured,
}: Props) {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <ListingForm
          locale={locale}
          labels={labels}
          translationEnabled={false}
          translationLabels={translationLabels}
          action={createListingAction}
          submitLabel={submitLabel}
          onListingCreated={(id) => {
            setListingId(id);
            requestAnimationFrame(() => {
              document
                .getElementById("listing-photos")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
          mapsApiKey={mapsApiKey}
          mapLabels={mapLabels}
          mapsNotConfigured={mapsNotConfigured}
        />
      </Card>

      <Card id="listing-photos">
        <h2 className="mb-2 text-lg font-semibold">{mediaTitle}</h2>
        <p className="mb-4 text-sm text-text-muted">
          {listingId ? photosAfterSave : photosHint}
        </p>

        {listingId ? (
          <>
            <ListingMediaSection listingId={listingId} initialImages={[]} />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/dashboard/listings/${listingId}/edit?created=1`
                  )
                }
              >
                {continueEditing}
              </Button>
            </div>
          </>
        ) : (
          <div
            aria-hidden
            className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-muted p-6 text-center text-sm text-text-muted"
          >
            {photosHint}
          </div>
        )}
      </Card>
    </div>
  );
}

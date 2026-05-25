"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingMediaUploader } from "@/components/listings/listing-media-uploader";
import type { TranslationLabels } from "@/components/listings/listing-bilingual-fields";
import { createListingAction } from "@/lib/listings/actions";

type Props = {
  locale: string;
  labels: Record<string, string>;
  translationLabels: TranslationLabels;
  storageConfigured: boolean;
  submitLabel: string;
  mediaTitle: string;
  photosHint: string;
  photosAfterSave: string;
  continueEditing: string;
};

export function NewListingFlow({
  locale,
  labels,
  translationLabels,
  storageConfigured,
  submitLabel,
  mediaTitle,
  photosHint,
  photosAfterSave,
  continueEditing,
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
        />
      </Card>

      <Card id="listing-photos">
        <h2 className="mb-2 text-lg font-semibold">{mediaTitle}</h2>
        <p className="mb-4 text-sm text-text-muted">
          {listingId ? photosAfterSave : photosHint}
        </p>

        {listingId ? (
          <>
            <ListingMediaUploader
              listingId={listingId}
              initialImages={[]}
              storageConfigured={storageConfigured}
            />
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

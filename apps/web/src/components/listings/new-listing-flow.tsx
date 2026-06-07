"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
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

type WizardLabels = {
  detailsStep: string;
  detailsDesc: string;
  photosStep: string;
  photosDesc: string;
  publishStep: string;
  publishDesc: string;
  stepLabel: string;
  savedBadge: string;
  createTitle: string;
  createSubtitle: string;
};

type Props = {
  locale: string;
  labels: Record<string, string>;
  translationLabels: TranslationLabels;
  wizardLabels: WizardLabels;
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
  wizardLabels,
  submitLabel,
  mediaTitle,
  photosAfterSave,
  continueEditing,
  mapsApiKey,
  mapLabels,
  mapsNotConfigured,
}: Props) {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);

  // Step 1 = details, Step 2 = photos, Step 3 = review/publish
  const currentStep = listingId ? 2 : 1;

  const steps: { n: number; title: string; desc: string; icon: IconName }[] = [
    {
      n: 1,
      title: wizardLabels.detailsStep,
      desc: wizardLabels.detailsDesc,
      icon: "building",
    },
    {
      n: 2,
      title: wizardLabels.photosStep,
      desc: wizardLabels.photosDesc,
      icon: "image",
    },
    {
      n: 3,
      title: wizardLabels.publishStep,
      desc: wizardLabels.publishDesc,
      icon: "checkCircle",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-brand-500">
          {wizardLabels.stepLabel
            .replace("{current}", String(currentStep))
            .replace("{total}", "3")}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text">
          {wizardLabels.createTitle}
        </h1>
        <p className="mt-1 text-text-muted">{wizardLabels.createSubtitle}</p>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const done = step.n < currentStep;
          const active = step.n === currentStep;
          return (
            <li key={step.n} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-success bg-success text-white"
                      : active
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-border bg-surface text-text-subtle"
                  }`}
                >
                  {done ? (
                    <Icon name="check" size={18} />
                  ) : (
                    <Icon name={step.icon} size={18} />
                  )}
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={`truncate text-sm font-semibold ${
                      active || done ? "text-text" : "text-text-subtle"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="truncate text-xs text-text-muted">{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded-full ${
                    done ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step 1 — details */}
      {currentStep === 1 && (
        <Card className="animate-fade-in">
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
                window.scrollTo({ top: 0, behavior: "smooth" });
              });
            }}
            mapsApiKey={mapsApiKey}
            mapLabels={mapLabels}
            mapsNotConfigured={mapsNotConfigured}
          />
        </Card>
      )}

      {/* Step 2 — photos */}
      {currentStep === 2 && listingId && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 rounded-2xl border border-success/25 bg-success-soft px-4 py-3 text-sm font-semibold text-success">
            <Icon name="checkCircle" size={20} />
            {wizardLabels.savedBadge}
          </div>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <Icon name="image" size={20} className="text-brand-500" />
              <h2 className="text-lg font-bold">{mediaTitle}</h2>
            </div>
            <p className="mb-4 text-sm text-text-muted">{photosAfterSave}</p>

            <ListingMediaSection listingId={listingId} initialImages={[]} />

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
              <Button
                type="button"
                variant="accent"
                onClick={() =>
                  router.push(`/dashboard/listings/${listingId}/edit?created=1`)
                }
              >
                {continueEditing}
                <Icon name="arrowRight" size={16} className="rtl:rotate-180" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import type { Listing, KuwaitGovernorate } from "@aldlalz/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  GOVERNORATE_AREAS,
  GOVERNORATES,
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings/constants";
import { ListingMapPicker } from "@/components/listings/listing-map-picker";
import {
  ListingBilingualFields,
  type ListingBilingualFieldsHandle,
  type TranslationLabels,
} from "@/components/listings/listing-bilingual-fields";

type Props = {
  locale: string;
  labels: Record<string, string>;
  translationLabels: TranslationLabels;
  translationEnabled: boolean;
  action: (formData: FormData) => void | Promise<void | { id: string }>;
  listing?: Listing;
  submitLabel: string;
  onListingCreated?: (id: string) => void;
  mapsApiKey?: string;
  mapLabels?: {
    title: string;
    hint: string;
    addressLine: string;
    latitude: string;
    longitude: string;
  };
};

export function ListingForm({
  locale,
  labels,
  translationLabels,
  translationEnabled,
  action,
  listing,
  submitLabel,
  onListingCreated,
  mapsApiKey,
  mapLabels,
}: Props) {
  const [governorate, setGovernorate] = useState<KuwaitGovernorate>(
    listing?.governorate ?? "CAPITAL"
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const bilingualRef = useRef<ListingBilingualFieldsHandle>(null);

  const areas = GOVERNORATE_AREAS[governorate] ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    if (translationEnabled && bilingualRef.current) {
      const ok = await bilingualRef.current.ensureTranslated();
      if (!ok) {
        setSubmitError(translationLabels.translationFailed);
        return;
      }
    }

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      const result = await action(formData);
      if (result && typeof result === "object" && "id" in result) {
        onListingCreated?.(result.id);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="listingType">{labels.listingType}</Label>
          <Select
            id="listingType"
            name="listingType"
            defaultValue={listing?.listingType ?? "SALE"}
            required
          >
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {labelFor(LISTING_TYPE_LABELS, type, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyType">{labels.propertyType}</Label>
          <Select
            id="propertyType"
            name="propertyType"
            defaultValue={listing?.propertyType ?? "APARTMENT"}
            required
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {labelFor(PROPERTY_TYPE_LABELS, type, locale)}
              </option>
            ))}
          </Select>
        </div>

        <ListingBilingualFields
          ref={bilingualRef}
          locale={locale}
          translationEnabled={translationEnabled}
          labels={translationLabels}
          initialTitleAr={listing?.titleAr ?? ""}
          initialTitleEn={listing?.titleEn ?? ""}
          initialDescriptionAr={listing?.descriptionAr ?? ""}
          initialDescriptionEn={listing?.descriptionEn ?? ""}
        />

        <div>
          <Label htmlFor="priceKwd">{labels.priceKwd}</Label>
          <Input
            id="priceKwd"
            name="priceKwd"
            type="number"
            min={0}
            step="0.001"
            defaultValue={listing?.priceKwd.toString() ?? ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="paciNumber">{labels.paciNumber}</Label>
          <Input
            id="paciNumber"
            name="paciNumber"
            defaultValue={listing?.paciNumber ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="governorate">{labels.governorate}</Label>
          <Select
            id="governorate"
            name="governorate"
            value={governorate}
            onChange={(e) =>
              setGovernorate(e.target.value as KuwaitGovernorate)
            }
            required
          >
            {GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {labelFor(GOVERNORATE_LABELS, gov, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="area">{labels.area}</Label>
          <Select
            id="area"
            name="area"
            key={governorate}
            defaultValue={listing?.area ?? ""}
            required
          >
            <option value="">{labels.selectArea}</option>
            {areas.map((area) => (
              <option key={area.ar} value={area.ar}>
                {locale === "ar" ? area.ar : area.en}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="bedrooms">{labels.bedrooms}</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            defaultValue={listing?.bedrooms ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">{labels.bathrooms}</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min={0}
            defaultValue={listing?.bathrooms ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="parking">{labels.parking}</Label>
          <Input
            id="parking"
            name="parking"
            type="number"
            min={0}
            defaultValue={listing?.parking ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="sizeM2">{labels.sizeM2}</Label>
          <Input
            id="sizeM2"
            name="sizeM2"
            type="number"
            min={0}
            step="0.01"
            defaultValue={listing?.sizeM2?.toString() ?? ""}
          />
        </div>
      </div>

      {mapsApiKey && mapLabels && (
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
          <ListingMapPicker
            apiKey={mapsApiKey}
            labels={mapLabels}
            initialLat={
              listing?.latitude != null
                ? Number(listing.latitude.toString())
                : null
            }
            initialLng={
              listing?.longitude != null
                ? Number(listing.longitude.toString())
                : null
            }
            initialAddress={listing?.addressLine}
          />
        </div>
      )}

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? translationLabels.translating : submitLabel}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { Listing, KuwaitGovernorate } from "@aldlalz/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

type Props = {
  locale: string;
  labels: Record<string, string>;
  action: (formData: FormData) => void | Promise<void>;
  listing?: Listing;
  submitLabel: string;
};

export function ListingForm({
  locale,
  labels,
  action,
  listing,
  submitLabel,
}: Props) {
  const [governorate, setGovernorate] = useState<KuwaitGovernorate>(
    listing?.governorate ?? "CAPITAL"
  );

  const areas = GOVERNORATE_AREAS[governorate] ?? [];

  return (
    <form action={action} className="space-y-6">
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

        <div className="md:col-span-2">
          <Label htmlFor="titleAr">{labels.titleAr}</Label>
          <Input
            id="titleAr"
            name="titleAr"
            defaultValue={listing?.titleAr ?? ""}
            required
            dir="rtl"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="titleEn">{labels.titleEn}</Label>
          <Input
            id="titleEn"
            name="titleEn"
            defaultValue={listing?.titleEn ?? ""}
            dir="ltr"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="descriptionAr">{labels.descriptionAr}</Label>
          <Textarea
            id="descriptionAr"
            name="descriptionAr"
            defaultValue={listing?.descriptionAr ?? ""}
            dir="rtl"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="descriptionEn">{labels.descriptionEn}</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            defaultValue={listing?.descriptionEn ?? ""}
            dir="ltr"
          />
        </div>

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

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}

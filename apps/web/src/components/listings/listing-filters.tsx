"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import type { ListingSearchParams } from "@/lib/listings/validation";
import type { KuwaitGovernorate } from "@aldlalz/database";
import { useMemo, useState } from "react";

type Props = {
  initial: ListingSearchParams;
};

export function ListingFilters({ initial }: Props) {
  const t = useTranslations("listings.filters");
  const locale = useLocale();
  const router = useRouter();

  const [governorate, setGovernorate] = useState(initial.governorate ?? "");

  const areas = useMemo(() => {
    if (!governorate) return [];
    return GOVERNORATE_AREAS[governorate as KuwaitGovernorate] ?? [];
  }, [governorate]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }

    router.push(`/listings?${params.toString()}`);
  }

  function onReset() {
    router.push("/listings");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 rounded-xl border border-border bg-surface p-4 shadow-sm md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label htmlFor="q">{t("search")}</Label>
          <Input
            id="q"
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="listingType">{t("listingType")}</Label>
          <Select
            id="listingType"
            name="listingType"
            defaultValue={initial.listingType ?? ""}
          >
            <option value="">{t("all")}</option>
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {labelFor(LISTING_TYPE_LABELS, type, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyType">{t("propertyType")}</Label>
          <Select
            id="propertyType"
            name="propertyType"
            defaultValue={initial.propertyType ?? ""}
          >
            <option value="">{t("all")}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {labelFor(PROPERTY_TYPE_LABELS, type, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="governorate">{t("governorate")}</Label>
          <Select
            id="governorate"
            name="governorate"
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
          >
            <option value="">{t("all")}</option>
            {GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {labelFor(GOVERNORATE_LABELS, gov, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="area">{t("area")}</Label>
          <Select
            id="area"
            name="area"
            defaultValue={initial.area ?? ""}
            disabled={!governorate}
          >
            <option value="">{t("all")}</option>
            {areas.map((area) => (
              <option key={area.ar} value={area.ar}>
                {locale === "ar" ? area.ar : area.en}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="minPrice">{t("minPrice")}</Label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step="0.001"
            defaultValue={initial.minPrice ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="maxPrice">{t("maxPrice")}</Label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step="0.001"
            defaultValue={initial.maxPrice ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
          <Select
            id="bedrooms"
            name="bedrooms"
            defaultValue={initial.bedrooms ?? ""}
          >
            <option value="">{t("all")}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
          <Select
            id="bathrooms"
            name="bathrooms"
            defaultValue={initial.bathrooms ?? ""}
          >
            <option value="">{t("all")}</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">{t("apply")}</Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          {t("reset")}
        </Button>
      </div>
    </form>
  );
}

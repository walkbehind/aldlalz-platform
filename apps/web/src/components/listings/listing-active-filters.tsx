"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings/constants";
import type { ListingSearchParams } from "@/lib/listings/validation";

type Props = {
  filters: ListingSearchParams;
};

type Chip = { key: string; label: string };

export function ListingActiveFilters({ filters }: Props) {
  const t = useTranslations("listings.filters");
  const locale = useLocale();
  const router = useRouter();

  const chips: Chip[] = [];

  if (filters.q?.trim()) chips.push({ key: "q", label: filters.q.trim() });
  if (filters.listingType) {
    chips.push({
      key: "listingType",
      label: labelFor(LISTING_TYPE_LABELS, filters.listingType, locale),
    });
  }
  if (filters.propertyType) {
    chips.push({
      key: "propertyType",
      label: labelFor(PROPERTY_TYPE_LABELS, filters.propertyType, locale),
    });
  }
  if (filters.governorate) {
    chips.push({
      key: "governorate",
      label: labelFor(GOVERNORATE_LABELS, filters.governorate, locale),
    });
  }
  if (filters.area?.trim()) chips.push({ key: "area", label: filters.area.trim() });
  if (filters.minPrice) {
    chips.push({ key: "minPrice", label: `${t("minPrice")}: ${filters.minPrice}` });
  }
  if (filters.maxPrice) {
    chips.push({ key: "maxPrice", label: `${t("maxPrice")}: ${filters.maxPrice}` });
  }
  if (filters.bedrooms) {
    chips.push({ key: "bedrooms", label: `${t("bedrooms")}: ${filters.bedrooms}+` });
  }
  if (filters.bathrooms) {
    chips.push({ key: "bathrooms", label: `${t("bathrooms")}: ${filters.bathrooms}+` });
  }
  if (filters.sort && filters.sort !== "newest") {
    chips.push({ key: "sort", label: t(`sortOptions.${filters.sort}`) });
  }

  if (chips.length === 0) return null;

  function removeKey(key: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (!v || k === key || k === "page") continue;
      params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : "/listings");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-muted">{t("activeFilters")}</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeKey(chip.key)}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm text-brand-800"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push("/listings")}
        className="text-sm text-brand-600 hover:underline"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}

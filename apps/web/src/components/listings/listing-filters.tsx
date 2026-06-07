"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
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
  const t = useTranslations("listings");
  const tf = useTranslations("listings.filters");
  const locale = useLocale();
  const router = useRouter();

  const [governorate, setGovernorate] = useState(initial.governorate ?? "");
  const [open, setOpen] = useState(false);

  const areas = useMemo(() => {
    if (!governorate) return [];
    return GOVERNORATE_AREAS[governorate as KuwaitGovernorate] ?? [];
  }, [governorate]);

  const activeCount = useMemo(
    () =>
      Object.entries(initial).filter(
        ([key, value]) => key !== "page" && value
      ).length,
    [initial]
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }
    router.push(`/listings?${params.toString()}`);
    setOpen(false);
  }

  function onReset() {
    setGovernorate("");
    router.push("/listings");
    setOpen(false);
  }

  return (
    <>
      {/* Mobile toggle bar */}
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text shadow-[var(--shadow-card)]"
          aria-expanded={open}
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="filter" size={18} className="text-brand-500" />
            {t("showFilters")}
          </span>
          {activeCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            {t("clearAll")}
          </Button>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className={`${
          open ? "block" : "hidden"
        } mb-6 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:mb-0 lg:block`}
      >
        <div className="mb-4 hidden items-center justify-between lg:flex">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-text">
            <Icon name="filter" size={18} className="text-brand-500" />
            {tf("title")}
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-medium text-brand-500 hover:underline"
            >
              {t("clearAll")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Field label={tf("search")} className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-subtle start-3"
              />
              <Input
                id="q"
                name="q"
                defaultValue={initial.q ?? ""}
                placeholder={tf("searchPlaceholder")}
                className="ps-10"
              />
            </div>
          </Field>

          <Field label={tf("listingType")}>
            <Select
              id="listingType"
              name="listingType"
              defaultValue={initial.listingType ?? ""}
            >
              <option value="">{tf("all")}</option>
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labelFor(LISTING_TYPE_LABELS, type, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={tf("propertyType")}>
            <Select
              id="propertyType"
              name="propertyType"
              defaultValue={initial.propertyType ?? ""}
            >
              <option value="">{tf("all")}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labelFor(PROPERTY_TYPE_LABELS, type, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={tf("governorate")}>
            <Select
              id="governorate"
              name="governorate"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
            >
              <option value="">{tf("all")}</option>
              {GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {labelFor(GOVERNORATE_LABELS, gov, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={tf("area")}>
            <Select
              id="area"
              name="area"
              defaultValue={initial.area ?? ""}
              disabled={!governorate}
            >
              <option value="">{tf("all")}</option>
              {areas.map((area) => (
                <option key={area.ar} value={area.ar}>
                  {locale === "ar" ? area.ar : area.en}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={tf("price")}>
            <div className="flex items-center gap-2">
              <Input
                id="minPrice"
                name="minPrice"
                type="number"
                min={0}
                step="0.001"
                placeholder={tf("minPrice")}
                defaultValue={initial.minPrice ?? ""}
              />
              <span className="text-text-subtle">—</span>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min={0}
                step="0.001"
                placeholder={tf("maxPrice")}
                defaultValue={initial.maxPrice ?? ""}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={tf("bedrooms")}>
              <Select
                id="bedrooms"
                name="bedrooms"
                defaultValue={initial.bedrooms ?? ""}
              >
                <option value="">{tf("all")}</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={tf("bathrooms")}>
              <Select
                id="bathrooms"
                name="bathrooms"
                defaultValue={initial.bathrooms ?? ""}
              >
                <option value="">{tf("all")}</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="submit" className="flex-1">
            <Icon name="search" size={16} />
            {t("applyFilters")}
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            {tf("reset")}
          </Button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

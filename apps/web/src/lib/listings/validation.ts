import { z } from "zod";
import {
  GOVERNORATES,
  LISTING_TYPES,
  PROPERTY_TYPES,
} from "./constants";

const optionalInt = z
  .union([z.literal(""), z.coerce.number().int().min(0).max(50)])
  .transform((v) => (v === "" ? undefined : v));

const optionalFloat = z
  .union([z.literal(""), z.coerce.number().positive().max(1_000_000)])
  .transform((v) => (v === "" ? undefined : v));

const optionalCoord = z
  .union([z.literal(""), z.coerce.number()])
  .transform((v) => (v === "" ? null : v));

export const listingFormSchema = z.object({
  listingType: z.enum(LISTING_TYPES as [string, ...string[]]),
  propertyType: z.enum(PROPERTY_TYPES as [string, ...string[]]),
  titleAr: z.string().trim().min(3, "titleArMin").max(200),
  titleEn: z.string().trim().max(200).optional(),
  descriptionAr: z.string().trim().max(5000).optional(),
  descriptionEn: z.string().trim().max(5000).optional(),
  priceKwd: z.coerce.number().positive("pricePositive"),
  governorate: z.enum(GOVERNORATES as [string, ...string[]]),
  area: z.string().trim().min(2, "areaMin").max(100),
  paciNumber: z.string().trim().max(50).optional(),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  parking: optionalInt,
  sizeM2: optionalFloat,
  latitude: optionalCoord,
  longitude: optionalCoord,
  addressLine: z.string().trim().max(300).optional(),
});

export type ListingFormInput = z.infer<typeof listingFormSchema>;

export function parseListingForm(formData: FormData) {
  const raw = {
    listingType: String(formData.get("listingType") ?? ""),
    propertyType: String(formData.get("propertyType") ?? ""),
    titleAr: String(formData.get("titleAr") ?? ""),
    titleEn: String(formData.get("titleEn") ?? "") || undefined,
    descriptionAr: String(formData.get("descriptionAr") ?? "") || undefined,
    descriptionEn: String(formData.get("descriptionEn") ?? "") || undefined,
    priceKwd: formData.get("priceKwd"),
    governorate: String(formData.get("governorate") ?? ""),
    area: String(formData.get("area") ?? ""),
    paciNumber: String(formData.get("paciNumber") ?? "") || undefined,
    bedrooms: formData.get("bedrooms") ?? "",
    bathrooms: formData.get("bathrooms") ?? "",
    parking: formData.get("parking") ?? "",
    sizeM2: formData.get("sizeM2") ?? "",
    latitude: formData.get("latitude") ?? "",
    longitude: formData.get("longitude") ?? "",
    addressLine: String(formData.get("addressLine") ?? "") || undefined,
  };

  return listingFormSchema.safeParse(raw);
}

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(3, "reasonMin").max(1000),
});

export type ListingSearchParams = {
  q?: string;
  listingType?: string;
  propertyType?: string;
  governorate?: string;
  area?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  page?: string;
};

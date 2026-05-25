"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
  prisma,
  type KuwaitGovernorate,
  type ListingType,
  type PropertyType,
} from "@aldlalz/database";
import { requireAdminUser, requireSessionUser } from "./auth";
import { parseListingForm, rejectListingSchema } from "./validation";

function listingDataFromParsed(parsed: ReturnType<typeof parseListingForm>) {
  if (!parsed.success) {
    throw new Error("VALIDATION");
  }
  const data = parsed.data;
  return {
    listingType: data.listingType as ListingType,
    propertyType: data.propertyType as PropertyType,
    titleAr: data.titleAr,
    titleEn: data.titleEn ?? null,
    descriptionAr: data.descriptionAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    priceKwd: data.priceKwd,
    governorate: data.governorate as KuwaitGovernorate,
    area: data.area,
    paciNumber: data.paciNumber ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    parking: data.parking ?? null,
    sizeM2: data.sizeM2 ?? null,
  };
}

function revalidateListingPaths(id?: string) {
  revalidatePath("/ar/listings");
  revalidatePath("/en/listings");
  revalidatePath("/ar/dashboard/listings");
  revalidatePath("/en/dashboard/listings");
  revalidatePath("/ar/admin/listings");
  revalidatePath("/en/admin/listings");
  if (id) {
    revalidatePath(`/ar/listings/${id}`);
    revalidatePath(`/en/listings/${id}`);
  }
}

export async function createListingAction(formData: FormData) {
  const user = await requireSessionUser();
  const parsed = parseListingForm(formData);
  const data = listingDataFromParsed(parsed);

  const listing = await prisma.listing.create({
    data: {
      ...data,
      ownerId: user.id,
      isDraft: true,
      adminStatus: "PENDING",
    },
  });

  revalidateListingPaths(listing.id);
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/listings/${listing.id}/edit?created=1`);
}

export async function updateListingAction(id: string, formData: FormData) {
  const user = await requireSessionUser();
  const existing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const parsed = parseListingForm(formData);
  const data = listingDataFromParsed(parsed);

  const needsReReview =
    !existing.isDraft && existing.adminStatus === "APPROVED";

  await prisma.listing.update({
    where: { id },
    data: {
      ...data,
      adminStatus: needsReReview ? "PENDING" : existing.adminStatus,
      rejectionReason: needsReReview ? null : existing.rejectionReason,
    },
  });

  revalidateListingPaths(id);
}

export async function updateListingAndRedirectAction(
  id: string,
  formData: FormData
) {
  await updateListingAction(id, formData);
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/listings/${id}/edit?saved=1`);
}

export async function submitListingAction(id: string) {
  const user = await requireSessionUser();
  const existing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await prisma.listing.update({
    where: { id },
    data: {
      isDraft: false,
      adminStatus: "PENDING",
      rejectionReason: null,
    },
  });

  revalidateListingPaths(id);
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/listings?submitted=1`);
}

export async function deleteDraftListingAction(id: string) {
  const user = await requireSessionUser();
  const existing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id, isDraft: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await prisma.listing.delete({ where: { id } });
  revalidateListingPaths();
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/listings`);
}

export async function approveListingAction(id: string) {
  await requireAdminUser();
  const existing = await prisma.listing.findFirst({
    where: { id, isDraft: false },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await prisma.listing.update({
    where: { id },
    data: {
      adminStatus: "APPROVED",
      rejectionReason: null,
    },
  });

  revalidateListingPaths(id);
}

export async function rejectListingAction(id: string, formData: FormData) {
  await requireAdminUser();
  const existing = await prisma.listing.findFirst({
    where: { id, isDraft: false },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const parsed = rejectListingSchema.safeParse({
    reason: String(formData.get("reason") ?? ""),
  });
  if (!parsed.success) throw new Error("VALIDATION");

  await prisma.listing.update({
    where: { id },
    data: {
      adminStatus: "REJECTED",
      rejectionReason: parsed.data.reason,
    },
  });

  revalidateListingPaths(id);
}

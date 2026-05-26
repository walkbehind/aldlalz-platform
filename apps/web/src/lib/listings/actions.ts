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
import { AppErrorCode, errorCodeFromUnknown, isNextRedirect, validationKeyFromForm } from "@/lib/app-errors";
import { isValidKuwaitCoordinate } from "@/lib/maps/kuwait";
import { deleteAllListingImagesFromStorage } from "@/lib/listings/images";
import { requireAdminUser, requireSessionUser } from "./auth";
import { parseListingForm, rejectListingSchema } from "./validation";
import { actionFail, actionOk, type ActionResult } from "./action-result";

function isDatabaseError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientUnknownRequestError" ||
      error.message.includes("Prisma"))
  );
}

function wrapAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => actionOk(data))
    .catch((error: unknown) => {
      if (isNextRedirect(error)) throw error;
      if (isDatabaseError(error)) {
        return actionFail(AppErrorCode.DATABASE_ERROR);
      }
      return actionFail(errorCodeFromUnknown(error));
    });
}

function listingDataFromParsed(parsed: ReturnType<typeof parseListingForm>) {
  if (!parsed.success) {
    throw new Error(validationKeyFromForm(parsed));
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
    latitude:
      data.latitude != null &&
      data.longitude != null &&
      isValidKuwaitCoordinate(data.latitude, data.longitude)
        ? data.latitude
        : null,
    longitude:
      data.latitude != null &&
      data.longitude != null &&
      isValidKuwaitCoordinate(data.latitude, data.longitude)
        ? data.longitude
        : null,
    addressLine: data.addressLine ?? null,
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

export async function createListingAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return wrapAction(async () => {
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
    return { id: listing.id };
  });
}

export async function updateListingAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  return wrapAction(async () => {
    const user = await requireSessionUser();
    const existing = await prisma.listing.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

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
  });
}

export async function updateListingAndRedirectAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const result = await updateListingAction(id, formData);
  if (!result.ok) return result;
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/listings/${id}/edit?saved=1`);
}

export async function submitListingAction(
  id: string
): Promise<ActionResult> {
  return wrapAction(async () => {
    const user = await requireSessionUser();
    const existing = await prisma.listing.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

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
  });
}

export async function deleteDraftListingAction(
  id: string
): Promise<ActionResult> {
  return wrapAction(async () => {
    const user = await requireSessionUser();
    const existing = await prisma.listing.findFirst({
      where: { id, ownerId: user.id, isDraft: true },
      include: { images: { select: { storagePath: true } } },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

    await deleteAllListingImagesFromStorage(
      user.id,
      id,
      existing.images.map((i) => i.storagePath)
    );

    await prisma.listing.delete({ where: { id } });
    revalidateListingPaths();
    const locale = await getLocale();
    redirect(`/${locale}/dashboard/listings`);
  });
}

export async function approveListingAction(
  id: string
): Promise<ActionResult> {
  return wrapAction(async () => {
    await requireAdminUser();
    const existing = await prisma.listing.findFirst({
      where: { id, isDraft: false },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

    await prisma.listing.update({
      where: { id },
      data: {
        adminStatus: "APPROVED",
        rejectionReason: null,
      },
    });

    revalidateListingPaths(id);
  });
}

export async function rejectListingAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  return wrapAction(async () => {
    await requireAdminUser();
    const existing = await prisma.listing.findFirst({
      where: { id, isDraft: false },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

    const parsed = rejectListingSchema.safeParse({
      reason: String(formData.get("reason") ?? ""),
    });
    if (!parsed.success) {
      throw new Error(validationKeyFromForm(parsed));
    }

    await prisma.listing.update({
      where: { id },
      data: {
        adminStatus: "REJECTED",
        rejectionReason: parsed.data.reason,
      },
    });

    revalidateListingPaths(id);
  });
}

export async function toggleListingFeaturedAction(
  id: string
): Promise<ActionResult> {
  return wrapAction(async () => {
    await requireAdminUser();
    const existing = await prisma.listing.findFirst({
      where: { id, isDraft: false, adminStatus: "APPROVED" },
    });
    if (!existing) throw new Error(AppErrorCode.NOT_FOUND);

    await prisma.listing.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
    });

    revalidateListingPaths(id);
  });
}

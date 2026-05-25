import {
  buildListingImagePath,
  createSupabaseAdminClient,
  getPublicStorageUrl,
  isSupabaseStorageConfigured,
  LISTING_IMAGES_BUCKET,
  MAX_IMAGES_PER_LISTING,
  MAX_UPLOAD_BYTES,
} from "@/lib/supabase/client";
import { isAllowedImageMime, optimizeListingImage } from "@/lib/images/optimize";
import { prisma } from "@aldlalz/database";
import { randomUUID } from "crypto";

export type ListingImageDto = {
  id: string;
  url: string;
  storagePath: string;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
};

export function toListingImageDto(image: {
  id: string;
  url: string;
  storagePath: string;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}): ListingImageDto {
  return {
    id: image.id,
    url: image.url,
    storagePath: image.storagePath,
    sortOrder: image.sortOrder,
    isCover: image.isCover,
    width: image.width,
    height: image.height,
  };
}

async function assertListingOwner(listingId: string, ownerId: string) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!listing) throw new Error("NOT_FOUND");
  return listing;
}

export async function uploadListingImages(
  listingId: string,
  ownerId: string,
  files: File[]
) {
  if (!isSupabaseStorageConfigured()) throw new Error("STORAGE_NOT_CONFIGURED");

  const listing = await assertListingOwner(listingId, ownerId);
  if (listing.images.length + files.length > MAX_IMAGES_PER_LISTING) {
    throw new Error("MAX_IMAGES");
  }

  const supabase = createSupabaseAdminClient();
  const created: ListingImageDto[] = [];
  let nextSort =
    listing.images.length > 0
      ? Math.max(...listing.images.map((i) => i.sortOrder)) + 1
      : 0;
  const shouldSetCover = listing.images.length === 0;

  for (const file of files) {
    if (!isAllowedImageMime(file.type)) throw new Error("INVALID_TYPE");
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");

    const raw = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeListingImage(raw);
    const fileName = `${randomUUID()}.webp`;
    const storagePath = buildListingImagePath(ownerId, listingId, fileName);

    const { error } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .upload(storagePath, optimized.buffer, {
        contentType: optimized.mimeType,
        upsert: false,
      });

    if (error) throw new Error("UPLOAD_FAILED");

    const url = getPublicStorageUrl(storagePath);
    const isCover = shouldSetCover && created.length === 0;

    const image = await prisma.listingImage.create({
      data: {
        listingId,
        url,
        storagePath,
        sortOrder: nextSort++,
        isCover,
        width: optimized.width,
        height: optimized.height,
        sizeBytes: optimized.buffer.length,
        mimeType: optimized.mimeType,
      },
    });

    created.push(toListingImageDto(image));
  }

  return created;
}

export async function deleteListingImage(
  listingId: string,
  ownerId: string,
  imageId: string
) {
  if (!isSupabaseStorageConfigured()) throw new Error("STORAGE_NOT_CONFIGURED");

  await assertListingOwner(listingId, ownerId);

  const image = await prisma.listingImage.findFirst({
    where: { id: imageId, listingId },
  });
  if (!image) throw new Error("NOT_FOUND");

  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([image.storagePath]);

  await prisma.listingImage.delete({ where: { id: imageId } });

  if (image.isCover) {
    const next = await prisma.listingImage.findFirst({
      where: { listingId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.listingImage.update({
        where: { id: next.id },
        data: { isCover: true },
      });
    }
  }
}

export async function setListingCoverImage(
  listingId: string,
  ownerId: string,
  imageId: string
) {
  await assertListingOwner(listingId, ownerId);

  const image = await prisma.listingImage.findFirst({
    where: { id: imageId, listingId },
  });
  if (!image) throw new Error("NOT_FOUND");

  await prisma.$transaction([
    prisma.listingImage.updateMany({
      where: { listingId },
      data: { isCover: false },
    }),
    prisma.listingImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);
}

export async function reorderListingImages(
  listingId: string,
  ownerId: string,
  orderedIds: string[]
) {
  const listing = await assertListingOwner(listingId, ownerId);
  const existingIds = new Set(listing.images.map((i) => i.id));
  if (
    orderedIds.length !== listing.images.length ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("INVALID_ORDER");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.listingImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}

export async function getListingImagesForOwner(
  listingId: string,
  ownerId: string
) {
  await assertListingOwner(listingId, ownerId);
  const images = await prisma.listingImage.findMany({
    where: { listingId },
    orderBy: { sortOrder: "asc" },
  });
  return images.map(toListingImageDto);
}

export function getCoverImage<T extends { isCover: boolean; url: string }>(
  images: T[]
): T | undefined {
  return images.find((i) => i.isCover) ?? images[0];
}

import {
  prisma,
  type AdminStatus,
  type Listing,
  type Prisma,
} from "@aldlalz/database";
import { PAGE_SIZE } from "./constants";
import type { ListingSearchParams } from "./validation";

export type ListingCardData = Pick<
  Listing,
  | "id"
  | "titleAr"
  | "titleEn"
  | "listingType"
  | "propertyType"
  | "priceKwd"
  | "governorate"
  | "area"
  | "bedrooms"
  | "bathrooms"
  | "sizeM2"
  | "createdAt"
>;

function buildPublicWhere(
  params: ListingSearchParams
): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    isDraft: false,
    adminStatus: "APPROVED",
  };

  if (params.listingType) {
    where.listingType = params.listingType as Listing["listingType"];
  }
  if (params.propertyType) {
    where.propertyType = params.propertyType as Listing["propertyType"];
  }
  if (params.governorate) {
    where.governorate = params.governorate as Listing["governorate"];
  }
  if (params.area?.trim()) {
    where.area = { contains: params.area.trim(), mode: "insensitive" };
  }
  if (params.bedrooms) {
    const beds = Number(params.bedrooms);
    if (!Number.isNaN(beds)) where.bedrooms = { gte: beds };
  }
  if (params.bathrooms) {
    const baths = Number(params.bathrooms);
    if (!Number.isNaN(baths)) where.bathrooms = { gte: baths };
  }
  if (params.minPrice || params.maxPrice) {
    where.priceKwd = {};
    if (params.minPrice) {
      const min = Number(params.minPrice);
      if (!Number.isNaN(min)) where.priceKwd.gte = min;
    }
    if (params.maxPrice) {
      const max = Number(params.maxPrice);
      if (!Number.isNaN(max)) where.priceKwd.lte = max;
    }
  }
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { titleAr: { contains: q, mode: "insensitive" } },
      { titleEn: { contains: q, mode: "insensitive" } },
      { area: { contains: q, mode: "insensitive" } },
      { descriptionAr: { contains: q, mode: "insensitive" } },
      { descriptionEn: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function searchPublicListings(params: ListingSearchParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const where = buildPublicWhere(params);

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        listingType: true,
        propertyType: true,
        priceKwd: true,
        governorate: true,
        area: true,
        bedrooms: true,
        bathrooms: true,
        sizeM2: true,
        createdAt: true,
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getPublicListingById(id: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      id,
      isDraft: false,
      adminStatus: "APPROVED",
    },
    include: {
      owner: {
        select: { id: true, nameAr: true, nameEn: true, phone: true },
      },
    },
  });

  if (listing) {
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return listing;
}

export async function getOwnerListings(ownerId: string) {
  return prisma.listing.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getOwnerListing(ownerId: string, id: string) {
  return prisma.listing.findFirst({
    where: { id, ownerId },
  });
}

export async function getAdminListings(adminStatus: AdminStatus) {
  return prisma.listing.findMany({
    where: {
      isDraft: false,
      adminStatus,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: {
        select: { id: true, email: true, nameAr: true, nameEn: true },
      },
    },
  });
}

export async function getAdminListingCounts() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.listing.count({ where: { isDraft: false, adminStatus: "PENDING" } }),
    prisma.listing.count({
      where: { isDraft: false, adminStatus: "APPROVED" },
    }),
    prisma.listing.count({
      where: { isDraft: false, adminStatus: "REJECTED" },
    }),
  ]);
  return { pending, approved, rejected };
}

export function serializeListing(listing: Listing) {
  return {
    ...listing,
    priceKwd: listing.priceKwd.toString(),
    sizeM2: listing.sizeM2?.toString() ?? null,
  };
}

export type SerializedListing = ReturnType<typeof serializeListing>;

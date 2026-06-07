import { cache } from "react";
import { prisma, type FeaturedRequestStatus } from "@aldlalz/database";
import { requireAdminUser } from "@/lib/listings/auth";

/** Marks expired featured requests and clears listing flags. Once per request. */
export const expireStaleFeaturedListings = cache(async () => {
  const now = new Date();
  const expired = await prisma.featuredRequest.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    select: { id: true, listingId: true },
  });

  if (expired.length === 0) return;

  await prisma.$transaction([
    ...expired.map((r) =>
      prisma.featuredRequest.update({
        where: { id: r.id },
        data: { status: "EXPIRED" },
      })
    ),
    ...expired.map((r) =>
      prisma.listing.update({
        where: { id: r.listingId },
        data: { isFeatured: false },
      })
    ),
  ]);
});

export async function listFeaturedRequests(status?: FeaturedRequestStatus) {
  await requireAdminUser();
  await expireStaleFeaturedListings();
  return prisma.featuredRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { requestedAt: "desc" },
    include: {
      user: { select: { email: true, nameAr: true, nameEn: true } },
      listing: {
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          adminStatus: true,
          isFeatured: true,
        },
      },
    },
    take: 100,
  });
}

export async function listOwnerFeaturedRequests(userId: string) {
  return prisma.featuredRequest.findMany({
    where: { userId },
    orderBy: { requestedAt: "desc" },
    include: {
      listing: { select: { titleAr: true, titleEn: true, id: true } },
    },
  });
}

export async function getPendingFeaturedCount() {
  return prisma.featuredRequest.count({
    where: { status: { in: ["PENDING", "APPROVED", "PAYMENT_CONFIRMED"] } },
  });
}

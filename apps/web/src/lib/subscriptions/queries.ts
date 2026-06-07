import { prisma, type SubscriptionStatus } from "@aldlalz/database";
import { FREE_TIER_MAX_LISTINGS, UNLIMITED_LISTING_ROLES } from "./constants";

export type ActiveSubscription = {
  id: string;
  packageId: string;
  maxListings: number;
  expiresAt: Date;
  status: SubscriptionStatus;
  packageNameAr: string;
  packageNameEn: string | null;
};

export async function getActiveSubscription(
  userId: string
): Promise<ActiveSubscription | null> {
  const now = new Date();
  const sub = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expiresAt: { gt: now },
    },
    orderBy: { expiresAt: "desc" },
    include: {
      package: { select: { nameAr: true, nameEn: true } },
    },
  });

  if (!sub) return null;

  return {
    id: sub.id,
    packageId: sub.packageId,
    maxListings: sub.maxListings,
    expiresAt: sub.expiresAt,
    status: sub.status,
    packageNameAr: sub.package.nameAr,
    packageNameEn: sub.package.nameEn,
  };
}

export async function countBillableListings(userId: string): Promise<number> {
  return prisma.listing.count({
    where: {
      ownerId: userId,
      isDraft: false,
      adminStatus: { in: ["PENDING", "APPROVED"] },
    },
  });
}

export async function getUserListingLimit(userId: string, role: string): Promise<number> {
  if (UNLIMITED_LISTING_ROLES.includes(role as (typeof UNLIMITED_LISTING_ROLES)[number])) {
    return Number.MAX_SAFE_INTEGER;
  }

  const active = await getActiveSubscription(userId);
  if (active) return active.maxListings;

  return FREE_TIER_MAX_LISTINGS;
}

export type ListingLimitCheck = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  hasSubscription: boolean;
};

export async function checkListingLimit(
  userId: string,
  role: string
): Promise<ListingLimitCheck> {
  const [limit, used] = await Promise.all([
    getUserListingLimit(userId, role),
    countBillableListings(userId),
  ]);

  const active = await getActiveSubscription(userId);

  return {
    allowed: used < limit,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    hasSubscription: !!active,
  };
}

export async function listActivePackages() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { tier: "asc" },
  });
}

export async function listUserSubscriptions(userId?: string) {
  return prisma.userSubscription.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, nameAr: true, nameEn: true } },
      package: { select: { nameAr: true, nameEn: true, tier: true } },
    },
    take: 100,
  });
}

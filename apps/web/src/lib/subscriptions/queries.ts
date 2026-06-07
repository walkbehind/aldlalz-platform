import { prisma, type SubscriptionStatus } from "@aldlalz/database";
import {
  ADMIN_MAX_LISTINGS,
  FREE_TIER_MAX_LISTINGS,
} from "./constants";
import { isAdminRole } from "@/lib/listings/auth";

export type ActiveSubscription = {
  id: string;
  planId: string;
  maxListings: number;
  expiresAt: Date;
  status: SubscriptionStatus;
  planNameAr: string;
  planNameEn: string | null;
  includedFeatureCredits: number;
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
      plan: {
        select: {
          nameAr: true,
          nameEn: true,
          includedFeatureCredits: true,
        },
      },
    },
  });

  if (!sub) return null;

  return {
    id: sub.id,
    planId: sub.planId,
    maxListings: sub.maxListings,
    expiresAt: sub.expiresAt,
    status: sub.status,
    planNameAr: sub.plan.nameAr,
    planNameEn: sub.plan.nameEn,
    includedFeatureCredits: sub.plan.includedFeatureCredits,
  };
}

/** Active = submitted and pending approval or live */
export async function countActiveListings(userId: string): Promise<number> {
  return prisma.listing.count({
    where: {
      ownerId: userId,
      isDraft: false,
      adminStatus: { in: ["PENDING", "APPROVED"] },
    },
  });
}

export async function getUserListingLimit(
  userId: string,
  role: string
): Promise<number> {
  if (isAdminRole(role as "ADMIN" | "SUPERADMIN")) {
    return ADMIN_MAX_LISTINGS;
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
    countActiveListings(userId),
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

export async function listActivePlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { tier: "asc" },
  });
}

export async function listAllPlans() {
  return prisma.subscriptionPlan.findMany({
    orderBy: { tier: "asc" },
  });
}

export async function listUserSubscriptions(userId?: string) {
  return prisma.userSubscription.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, nameAr: true, nameEn: true } },
      plan: {
        select: {
          nameAr: true,
          nameEn: true,
          tier: true,
          slug: true,
        },
      },
    },
    take: 200,
  });
}

/** @deprecated use listActivePlans */
export const listActivePackages = listActivePlans;

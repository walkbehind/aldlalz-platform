import { cache } from "react";
import { prisma, type AdminStatus, type SubscriptionStatus } from "@aldlalz/database";
import {
  ADMIN_MAX_LISTINGS,
  FREE_TIER_MAX_LISTINGS,
} from "./constants";
import { isAdminRole, requireAdminUser } from "@/lib/listings/auth";

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

/** Marks past-due ACTIVE subscriptions as EXPIRED (lazy expiry). Once per request. */
export const expireStaleSubscriptions = cache(async () => {
  const now = new Date();
  await prisma.userSubscription.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });
});

export function getEffectiveSubscriptionStatus(sub: {
  status: SubscriptionStatus;
  expiresAt: Date;
}): SubscriptionStatus {
  if (sub.status === "ACTIVE" && sub.expiresAt <= new Date()) {
    return "EXPIRED";
  }
  return sub.status;
}

const fetchActiveSubscription = cache(
  async (userId: string): Promise<ActiveSubscription | null> => {
    await expireStaleSubscriptions();

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
);

export async function getActiveSubscription(
  userId: string
): Promise<ActiveSubscription | null> {
  return fetchActiveSubscription(userId);
}

/** Batch active subscription lookup — one query for admin user lists. */
export async function getActiveSubscriptionsForUsers(
  userIds: string[]
): Promise<Map<string, ActiveSubscription>> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return new Map();

  await expireStaleSubscriptions();

  const now = new Date();
  const subs = await prisma.userSubscription.findMany({
    where: {
      userId: { in: uniqueIds },
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

  const map = new Map<string, ActiveSubscription>();
  for (const sub of subs) {
    if (map.has(sub.userId)) continue;
    map.set(sub.userId, {
      id: sub.id,
      planId: sub.planId,
      maxListings: sub.maxListings,
      expiresAt: sub.expiresAt,
      status: sub.status,
      planNameAr: sub.plan.nameAr,
      planNameEn: sub.plan.nameEn,
      includedFeatureCredits: sub.plan.includedFeatureCredits,
    });
  }
  return map;
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

function listingLimitForRole(
  role: string,
  subscription: ActiveSubscription | null
): number {
  if (isAdminRole(role as "ADMIN" | "SUPERADMIN")) {
    return ADMIN_MAX_LISTINGS;
  }
  if (subscription) return subscription.maxListings;
  return FREE_TIER_MAX_LISTINGS;
}

export async function getUserListingLimit(
  userId: string,
  role: string
): Promise<number> {
  const subscription = await getActiveSubscription(userId);
  return listingLimitForRole(role, subscription);
}

export type ListingLimitCheck = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  hasSubscription: boolean;
  subscription: ActiveSubscription | null;
};

export async function checkListingLimit(
  userId: string,
  role: string
): Promise<ListingLimitCheck> {
  const subscription = await getActiveSubscription(userId);
  const limit = listingLimitForRole(role, subscription);
  const used = await countActiveListings(userId);

  return {
    allowed: used < limit,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    hasSubscription: !!subscription,
    subscription,
  };
}

export function listingCountsTowardLimit(listing: {
  isDraft: boolean;
  adminStatus: AdminStatus | string;
}): boolean {
  return (
    !listing.isDraft &&
    (listing.adminStatus === "PENDING" || listing.adminStatus === "APPROVED")
  );
}

/** Throws LISTING_LIMIT_REACHED when submit would exceed capacity (draft or rejected resubmit). */
export async function assertCanSubmitListing(
  userId: string,
  role: string,
  listing: { id: string; isDraft: boolean; adminStatus: AdminStatus | string }
): Promise<void> {
  if (listingCountsTowardLimit(listing)) {
    return;
  }

  const limit = await getUserListingLimit(userId, role);
  const used = await countActiveListings(userId);
  if (used >= limit) {
    throw new Error("LISTING_LIMIT_REACHED");
  }
}

/** Throws LISTING_LIMIT_REACHED when owner already exceeds plan capacity. */
export async function assertCanApproveListing(
  ownerId: string,
  ownerRole: string
): Promise<void> {
  const limits = await checkListingLimit(ownerId, ownerRole);
  if (limits.used > limits.limit) {
    throw new Error("LISTING_LIMIT_REACHED");
  }
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
  await requireAdminUser();
  await expireStaleSubscriptions();

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

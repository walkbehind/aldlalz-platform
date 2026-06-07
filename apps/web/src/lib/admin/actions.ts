"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma, type UserRole } from "@aldlalz/database";
import { AppErrorCode } from "@/lib/app-errors";
import { requireAdminUser, isAdminRole } from "@/lib/listings/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/listings/action-result";
import { grantSubscription, cancelSubscription } from "@/lib/billing";

const PROMOTABLE_ROLES: UserRole[] = ["USER", "OWNER", "BROKER", "OFFICE"];

const setPasswordSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORD_MISMATCH",
  });

function revalidateAdminPaths() {
  revalidatePath("/ar/admin/users");
  revalidatePath("/en/admin/users");
  revalidatePath("/ar/admin/subscriptions");
  revalidatePath("/en/admin/subscriptions");
  revalidatePath("/ar/admin/plans");
  revalidatePath("/en/admin/plans");
  revalidatePath("/ar/admin/featured");
  revalidatePath("/en/admin/featured");
}

function revalidatePublicListingPaths(listingIds: string[] = []) {
  revalidatePath("/ar");
  revalidatePath("/en");
  revalidatePath("/ar/listings");
  revalidatePath("/en/listings");
  for (const id of listingIds) {
    revalidatePath(`/ar/listings/${id}`);
    revalidatePath(`/en/listings/${id}`);
  }
}

async function hideInactiveUserListings(userId: string) {
  const listings = await prisma.listing.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const listingIds = listings.map((listing) => listing.id);
  if (listingIds.length === 0) return listingIds;

  await prisma.$transaction([
    prisma.listing.updateMany({
      where: { ownerId: userId },
      data: { isFeatured: false },
    }),
    prisma.featuredRequest.updateMany({
      where: {
        listingId: { in: listingIds },
        status: "ACTIVE",
      },
      data: { status: "EXPIRED" },
    }),
    prisma.featuredRequest.updateMany({
      where: {
        listingId: { in: listingIds },
        status: { in: ["PENDING", "APPROVED", "PAYMENT_CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    }),
  ]);

  return listingIds;
}

export async function grantSubscriptionAction(
  userId: string,
  planId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await grantSubscription({ userId, planId, billingProvider: "MANUAL" });
    revalidateAdminPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
      if (error.message === "PLAN_NOT_FOUND") return actionFail("PLAN_NOT_FOUND");
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await cancelSubscription(subscriptionId);
    revalidateAdminPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
      if (error.message === "NOT_FOUND") return actionFail(AppErrorCode.NOT_FOUND);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  try {
    const admin = await requireAdminUser();

    if (!PROMOTABLE_ROLES.includes(role) && !isAdminRole(role)) {
      return actionFail(AppErrorCode.VALIDATION);
    }

    if (isAdminRole(role) && admin.role !== "SUPERADMIN") {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return actionFail(AppErrorCode.NOT_FOUND);

    if (isAdminRole(target.role) && admin.role !== "SUPERADMIN") {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidateAdminPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function toggleUserActiveAction(
  userId: string
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const admin = await requireAdminUser();
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return actionFail(AppErrorCode.NOT_FOUND);

    if (target.id === admin.id) {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    if (isAdminRole(target.role) && admin.role !== "SUPERADMIN") {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !target.isActive },
      select: { isActive: true },
    });

    let listingIds: string[] = [];
    if (!updated.isActive) {
      listingIds = await hideInactiveUserListings(userId);
    } else {
      const listings = await prisma.listing.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      listingIds = listings.map((listing) => listing.id);
    }

    revalidateAdminPaths();
    revalidatePublicListingPaths(listingIds);
    return actionOk({ isActive: updated.isActive });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function setUserPasswordAction(
  userId: string,
  password: string,
  confirmPassword: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdminUser();
    const parsed = setPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const code = parsed.error.issues[0]?.message ?? AppErrorCode.VALIDATION;
      return actionFail(code);
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return actionFail(AppErrorCode.NOT_FOUND);

    if (target.id === admin.id) {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    if (isAdminRole(target.role) && admin.role !== "SUPERADMIN") {
      return actionFail(AppErrorCode.FORBIDDEN);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    revalidateAdminPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function listAdminUsers(query?: string) {
  await requireAdminUser();

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { nameAr: { contains: query, mode: "insensitive" as const } },
          { nameEn: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query } },
        ],
      }
    : undefined;

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      nameAr: true,
      nameEn: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });
}

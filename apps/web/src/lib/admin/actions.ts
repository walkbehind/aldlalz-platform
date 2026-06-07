"use server";

import { revalidatePath } from "next/cache";
import { prisma, type UserRole } from "@aldlalz/database";
import { AppErrorCode } from "@/lib/app-errors";
import { requireAdminUser, isAdminRole } from "@/lib/listings/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/listings/action-result";
import { grantSubscription, cancelSubscription } from "@/lib/billing";

const PROMOTABLE_ROLES: UserRole[] = ["USER", "OWNER", "BROKER", "OFFICE"];

function revalidateAdminPaths() {
  revalidatePath("/ar/admin/users");
  revalidatePath("/en/admin/users");
  revalidatePath("/ar/admin/subscriptions");
  revalidatePath("/en/admin/subscriptions");
}

export async function grantSubscriptionAction(
  userId: string,
  packageId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    await grantSubscription({ userId, packageId, billingProvider: "MANUAL" });
    revalidateAdminPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return actionFail(AppErrorCode.UNAUTHORIZED);
      if (error.message === "FORBIDDEN") return actionFail(AppErrorCode.FORBIDDEN);
      if (error.message === "PACKAGE_NOT_FOUND") return actionFail("PACKAGE_NOT_FOUND");
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

    revalidateAdminPaths();
    return actionOk({ isActive: updated.isActive });
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

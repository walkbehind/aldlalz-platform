"use server";

import { revalidatePath } from "next/cache";
import { prisma, type FeatureDurationType, Prisma } from "@aldlalz/database";
import { AppErrorCode } from "@/lib/app-errors";
import { requireSessionUser, requireAdminUser } from "@/lib/listings/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/listings/action-result";
import {
  appliesHomeFeaturedFlag,
  DEFAULT_FEATURE_CURRENCY,
  DEFAULT_FEATURE_PLACEMENT,
  durationDaysForType,
  resolveFeaturePrice,
} from "./constants";

function revalidateFeaturedPaths() {
  const paths = [
    "/ar/admin/featured",
    "/en/admin/featured",
    "/ar/dashboard/featured",
    "/en/dashboard/featured",
    "/ar/listings",
    "/en/listings",
    "/ar",
    "/en",
  ];
  paths.forEach((p) => revalidatePath(p));
}

export async function createFeaturedRequestAction(
  listingId: string,
  durationType: FeatureDurationType
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        ownerId: user.id,
        isDraft: false,
        adminStatus: "APPROVED",
      },
    });
    if (!listing) return actionFail(AppErrorCode.NOT_FOUND);

    const pending = await prisma.featuredRequest.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "APPROVED", "PAYMENT_CONFIRMED", "ACTIVE"] },
      },
    });
    if (pending) return actionFail("FEATURE_REQUEST_EXISTS");

    const durationDays = durationDaysForType(durationType);

    try {
      await prisma.featuredRequest.create({
        data: {
          userId: user.id,
          listingId,
          placementType: DEFAULT_FEATURE_PLACEMENT,
          durationType,
          durationDays,
          status: "PENDING",
          currency: DEFAULT_FEATURE_CURRENCY,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return actionFail("FEATURE_REQUEST_EXISTS");
      }
      throw error;
    }

    revalidateFeaturedPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function approveFeaturedRequestAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    const req = await prisma.featuredRequest.findUnique({
      where: { id: requestId },
    });
    if (!req || req.status !== "PENDING") return actionFail(AppErrorCode.NOT_FOUND);

    const price = resolveFeaturePrice(req.placementType, req.durationType);

    await prisma.featuredRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        price,
        currency: req.currency || DEFAULT_FEATURE_CURRENCY,
      },
    });

    revalidateFeaturedPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function confirmFeaturedPaymentAction(
  requestId: string,
  paymentNote?: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    const req = await prisma.featuredRequest.findUnique({
      where: { id: requestId },
    });
    if (!req || req.status !== "APPROVED") return actionFail(AppErrorCode.NOT_FOUND);

    await prisma.featuredRequest.update({
      where: { id: requestId },
      data: {
        status: "PAYMENT_CONFIRMED",
        paidAt: new Date(),
        paymentNote: paymentNote?.trim() || null,
      },
    });

    revalidateFeaturedPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function activateFeaturedRequestAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    const req = await prisma.featuredRequest.findUnique({
      where: { id: requestId },
    });
    if (!req || req.status !== "PAYMENT_CONFIRMED") {
      return actionFail(AppErrorCode.NOT_FOUND);
    }

    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt);
    expiresAt.setDate(expiresAt.getDate() + req.durationDays);

    const listingUpdate = appliesHomeFeaturedFlag(req.placementType)
      ? prisma.listing.update({
          where: { id: req.listingId },
          data: { isFeatured: true },
        })
      : null;

    await prisma.$transaction([
      prisma.featuredRequest.update({
        where: { id: requestId },
        data: { status: "ACTIVE", activatedAt, expiresAt },
      }),
      ...(listingUpdate ? [listingUpdate] : []),
    ]);

    revalidateFeaturedPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function rejectFeaturedRequestAction(
  requestId: string,
  reason: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    if (reason.trim().length < 3) return actionFail(AppErrorCode.VALIDATION);

    const req = await prisma.featuredRequest.findUnique({
      where: { id: requestId },
    });
    if (!req || !["PENDING", "APPROVED"].includes(req.status)) {
      return actionFail(AppErrorCode.NOT_FOUND);
    }

    await prisma.featuredRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });

    revalidateFeaturedPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

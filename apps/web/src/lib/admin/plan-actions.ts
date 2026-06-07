"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@aldlalz/database";
import { AppErrorCode, validationKeyFromForm } from "@/lib/app-errors";
import { requireAdminUser } from "@/lib/listings/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/listings/action-result";

const planSchema = z.object({
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().max(120).optional(),
  descriptionAr: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional(),
  tier: z.coerce.number().int().min(1).max(99),
  durationDays: z.coerce.number().int().min(1).max(730),
  maxListings: z.coerce.number().int().min(1).max(500),
  includedFeatureCredits: z.coerce.number().int().min(0).max(50),
  priceKwd: z.coerce.number().positive(),
  isActive: z
    .union([z.literal("true"), z.literal("false"), z.literal("on")])
    .optional()
    .transform((v) => v === "true" || v === "on"),
});

function revalidatePlanPaths() {
  [
    "/ar/admin/plans",
    "/en/admin/plans",
    "/ar/packages",
    "/en/packages",
    "/ar/admin/users",
    "/en/admin/users",
  ].forEach((p) => revalidatePath(p));
}

export async function upsertPlanAction(
  formData: FormData,
  planId?: string
): Promise<ActionResult> {
  try {
    await requireAdminUser();
    const parsed = planSchema.safeParse({
      slug: formData.get("slug"),
      nameAr: formData.get("nameAr"),
      nameEn: formData.get("nameEn") || undefined,
      descriptionAr: formData.get("descriptionAr") || undefined,
      descriptionEn: formData.get("descriptionEn") || undefined,
      tier: formData.get("tier"),
      durationDays: formData.get("durationDays"),
      maxListings: formData.get("maxListings"),
      includedFeatureCredits: formData.get("includedFeatureCredits"),
      priceKwd: formData.get("priceKwd"),
      isActive: formData.get("isActive") ?? "true",
    });

    if (!parsed.success) {
      return actionFail(validationKeyFromForm(parsed));
    }

    const data = parsed.data;

    if (planId) {
      await prisma.subscriptionPlan.update({
        where: { id: planId },
        data,
      });
    } else {
      const exists = await prisma.subscriptionPlan.findUnique({
        where: { slug: data.slug },
      });
      if (exists) return actionFail("PLAN_SLUG_TAKEN");

      await prisma.subscriptionPlan.create({ data });
    }

    revalidatePlanPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function togglePlanActiveAction(planId: string): Promise<ActionResult> {
  try {
    await requireAdminUser();
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) return actionFail(AppErrorCode.NOT_FOUND);

    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    });

    revalidatePlanPaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}

export async function listPlansForAdmin() {
  await requireAdminUser();
  return prisma.subscriptionPlan.findMany({ orderBy: { tier: "asc" } });
}

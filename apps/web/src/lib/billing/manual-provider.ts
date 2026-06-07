import { prisma } from "@aldlalz/database";
import type {
  BillingProviderAdapter,
  GrantSubscriptionInput,
  GrantSubscriptionResult,
} from "./types";

export class ManualBillingProvider implements BillingProviderAdapter {
  readonly name = "MANUAL" as const;

  async grantSubscription(
    input: GrantSubscriptionInput
  ): Promise<GrantSubscriptionResult> {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: input.planId, isActive: true },
    });
    if (!plan) throw new Error("PLAN_NOT_FOUND");
    if (plan.maxListings <= 0) throw new Error("INVALID_PLAN_LIMIT");

    const durationDays = input.durationDays ?? plan.durationDays;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await prisma.userSubscription.updateMany({
      where: { userId: input.userId, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });

    const sub = await prisma.userSubscription.create({
      data: {
        userId: input.userId,
        planId: plan.id,
        status: "ACTIVE",
        billingProvider: input.billingProvider ?? "MANUAL",
        externalPaymentId: input.externalPaymentId ?? null,
        maxListings: plan.maxListings,
        startsAt,
        expiresAt,
      },
    });

    return {
      subscriptionId: sub.id,
      expiresAt: sub.expiresAt,
      maxListings: sub.maxListings,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED" },
    });
  }
}

const manualProvider = new ManualBillingProvider();

export function getBillingProvider(_provider: "MANUAL" | "KNET" = "MANUAL") {
  return manualProvider;
}

export async function grantSubscription(
  input: GrantSubscriptionInput
): Promise<GrantSubscriptionResult> {
  const adapter = getBillingProvider(input.billingProvider ?? "MANUAL");
  return adapter.grantSubscription(input);
}

export async function cancelSubscription(subscriptionId: string) {
  const sub = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    select: { billingProvider: true },
  });
  if (!sub) throw new Error("NOT_FOUND");
  const adapter = getBillingProvider(sub.billingProvider);
  return adapter.cancelSubscription(subscriptionId);
}

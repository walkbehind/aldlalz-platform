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
    const pkg = await prisma.package.findFirst({
      where: { id: input.packageId, isActive: true },
    });
    if (!pkg) throw new Error("PACKAGE_NOT_FOUND");

    const durationDays = input.durationDays ?? pkg.durationDays;
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
        packageId: pkg.id,
        status: "ACTIVE",
        billingProvider: input.billingProvider ?? "MANUAL",
        externalPaymentId: input.externalPaymentId ?? null,
        maxListings: pkg.maxListings,
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

export function getBillingProvider(provider: "MANUAL" | "KNET" = "MANUAL") {
  if (provider === "KNET") {
    // KNET adapter will plug in here without changing call sites.
    return manualProvider;
  }
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

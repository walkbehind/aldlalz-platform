import type { BillingProvider } from "@aldlalz/database";

export type GrantSubscriptionInput = {
  userId: string;
  packageId: string;
  billingProvider?: BillingProvider;
  externalPaymentId?: string;
  durationDays?: number;
};

export type GrantSubscriptionResult = {
  subscriptionId: string;
  expiresAt: Date;
  maxListings: number;
};

export interface BillingProviderAdapter {
  readonly name: BillingProvider;
  grantSubscription(input: GrantSubscriptionInput): Promise<GrantSubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

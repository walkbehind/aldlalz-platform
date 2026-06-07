export type GrantSubscriptionInput = {
  userId: string;
  planId: string;
  billingProvider?: "MANUAL" | "KNET";
  externalPaymentId?: string;
  durationDays?: number;
};

export type GrantSubscriptionResult = {
  subscriptionId: string;
  expiresAt: Date;
  maxListings: number;
};

export interface BillingProviderAdapter {
  readonly name: "MANUAL" | "KNET";
  grantSubscription(input: GrantSubscriptionInput): Promise<GrantSubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

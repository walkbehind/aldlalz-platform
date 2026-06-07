"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { grantSubscriptionAction } from "@/lib/admin/actions";
import { CancelSubscriptionButton } from "@/components/admin/cancel-subscription-button";

type PlanOption = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  maxListings: number;
};

type Props = {
  userId: string;
  plans: PlanOption[];
  activeSubscriptionId?: string | null;
  locale: string;
};

export function AdminGrantSubscriptionForm({
  userId,
  plans,
  activeSubscriptionId,
  locale,
}: Props) {
  const t = useTranslations("admin.subscriptions");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");

  function onGrant() {
    if (!planId) return;
    startTransition(async () => {
      await grantSubscriptionAction(userId, planId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[10rem]">
        <Select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          disabled={pending || plans.length === 0}
          aria-label={t("selectPlan")}
        >
          {plans.length === 0 ? (
            <option value="">{t("noPlans")}</option>
          ) : (
            plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {locale === "ar" ? plan.nameAr : plan.nameEn ?? plan.nameAr}
                {" · "}
                {plan.maxListings}
              </option>
            ))
          )}
        </Select>
      </div>
      <Button type="button" size="sm" disabled={pending || !planId} onClick={onGrant}>
        {t("grant")}
      </Button>
      {activeSubscriptionId && (
        <CancelSubscriptionButton
          subscriptionId={activeSubscriptionId}
          label={t("cancel")}
        />
      )}
    </div>
  );
}

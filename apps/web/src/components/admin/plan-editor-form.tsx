"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertPlanAction } from "@/lib/admin/plan-actions";

type Plan = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  tier: number;
  durationDays: number;
  maxListings: number;
  includedFeatureCredits: number;
  priceKwd: { toString(): string };
  isActive: boolean;
};

type Props = {
  plan?: Plan;
  labels: Record<string, string>;
};

export function PlanEditorForm({ plan, labels }: Props) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertPlanAction(formData, plan?.id);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {!plan && (
        <div>
          <Label htmlFor="slug">{labels.slug}</Label>
          <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
        </div>
      )}
      <div>
        <Label htmlFor="nameAr">{labels.nameAr}</Label>
        <Input id="nameAr" name="nameAr" defaultValue={plan?.nameAr ?? ""} required />
      </div>
      <div>
        <Label htmlFor="nameEn">{labels.nameEn}</Label>
        <Input id="nameEn" name="nameEn" defaultValue={plan?.nameEn ?? ""} />
      </div>
      <div>
        <Label htmlFor="tier">{labels.tier}</Label>
        <Input id="tier" name="tier" type="number" defaultValue={plan?.tier ?? 1} required />
      </div>
      <div>
        <Label htmlFor="durationDays">{labels.durationDays}</Label>
        <Input
          id="durationDays"
          name="durationDays"
          type="number"
          defaultValue={plan?.durationDays ?? 30}
          required
        />
      </div>
      <div>
        <Label htmlFor="maxListings">{labels.maxListings}</Label>
        <Input
          id="maxListings"
          name="maxListings"
          type="number"
          defaultValue={plan?.maxListings ?? 3}
          required
          min={1}
        />
      </div>
      <div>
        <Label htmlFor="includedFeatureCredits">{labels.includedFeatureCredits}</Label>
        <Input
          id="includedFeatureCredits"
          name="includedFeatureCredits"
          type="number"
          defaultValue={plan?.includedFeatureCredits ?? 0}
          min={0}
        />
      </div>
      <div>
        <Label htmlFor="priceKwd">{labels.priceKwd}</Label>
        <Input
          id="priceKwd"
          name="priceKwd"
          type="number"
          step="0.001"
          defaultValue={plan ? Number(plan.priceKwd) : 0}
          required
        />
      </div>
      {plan && <input type="hidden" name="slug" value={plan.slug} />}
      <input type="hidden" name="isActive" value={plan?.isActive !== false ? "true" : "false"} />
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? t("saving") : plan ? labels.save : labels.create}
        </Button>
      </div>
    </form>
  );
}

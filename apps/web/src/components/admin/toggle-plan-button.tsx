"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { togglePlanActiveAction } from "@/lib/admin/plan-actions";

type Props = { planId: string; isActive: boolean };

export function TogglePlanButton({ planId, isActive }: Props) {
  const t = useTranslations("admin.plans");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={isActive ? "secondary" : "primary"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await togglePlanActiveAction(planId);
          router.refresh();
        })
      }
    >
      {isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}

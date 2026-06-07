"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction } from "@/lib/admin/actions";

type Props = {
  subscriptionId: string;
  label: string;
};

export function CancelSubscriptionButton({ subscriptionId, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelSubscriptionAction(subscriptionId);
          router.refresh();
        })
      }
    >
      {label}
    </Button>
  );
}

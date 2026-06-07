"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type { FeatureDurationType } from "@aldlalz/database";
import { Select } from "@/components/ui/select";
import { createFeaturedRequestAction } from "@/lib/featured/actions";
import { FEATURE_TYPES } from "@/lib/featured/constants";

type Props = {
  listingId: string;
  labels: Record<string, string>;
};

export function RequestFeaturedButton({ listingId, labels }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(type: FeatureDurationType) {
    startTransition(async () => {
      await createFeaturedRequestAction(listingId, type);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value as FeatureDurationType;
          if (v) submit(v);
          e.target.value = "";
        }}
        disabled={pending}
        aria-label={labels.selectType}
        className="min-w-[10rem]"
      >
        <option value="">{labels.requestFeatured}</option>
        {FEATURE_TYPES.map((type) => (
          <option key={type} value={type}>
            {labels[type] ?? type}
          </option>
        ))}
      </Select>
    </div>
  );
}

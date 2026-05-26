"use client";

import { useTranslations } from "next-intl";
import { LoadingRow } from "@/components/ui/feedback";

export function MapPickerSkeleton() {
  const t = useTranslations("common");
  return (
    <div className="flex h-56 items-center rounded-xl bg-surface-muted sm:h-64 md:h-80">
      <LoadingRow label={t("loading")} />
    </div>
  );
}

"use client";

import { useTransition, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  grantSubscriptionAction,
  cancelSubscriptionAction,
} from "@/lib/admin/actions";

type PackageOption = {
  id: string;
  nameAr: string;
  nameEn: string | null;
};

type Props = {
  userId: string;
  packages: PackageOption[];
  activeSubscriptionId?: string | null;
  locale: string;
};

export function AdminGrantSubscriptionForm({
  userId,
  packages,
  activeSubscriptionId,
  locale,
}: Props) {
  const t = useTranslations("admin.subscriptions");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");

  function onGrant() {
    if (!packageId) return;
    startTransition(async () => {
      await grantSubscriptionAction(userId, packageId);
      router.refresh();
    });
  }

  function onCancel() {
    if (!activeSubscriptionId) return;
    startTransition(async () => {
      await cancelSubscriptionAction(activeSubscriptionId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[10rem]">
        <Select
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          disabled={pending}
          aria-label={t("selectPackage")}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {locale === "ar" ? pkg.nameAr : pkg.nameEn ?? pkg.nameAr}
            </option>
          ))}
        </Select>
      </div>
      <Button type="button" size="sm" disabled={pending || !packageId} onClick={onGrant}>
        {t("grant")}
      </Button>
      {activeSubscriptionId && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
      )}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProfileError({ reset }: Props) {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");

  return (
    <Card className="mx-auto max-w-lg p-6">
      <h2 className="text-lg font-semibold text-text">{t("loadError.title")}</h2>
      <p className="mt-2 text-sm text-text-muted">{tErrors("DATABASE_ERROR")}</p>
      <Button type="button" className="mt-4" onClick={reset}>
        {t("loadError.retry")}
      </Button>
    </Card>
  );
}

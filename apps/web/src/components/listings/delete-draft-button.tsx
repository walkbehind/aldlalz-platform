"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteDraftListingAction } from "@/lib/listings/actions";

type Props = {
  listingId: string;
};

export function DeleteDraftButton({ listingId }: Props) {
  const t = useTranslations("dashboard.listings");

  return (
    <form
      action={deleteDraftListingAction.bind(null, listingId)}
      onSubmit={(e) => {
        if (!confirm(t("deleteConfirm"))) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="outline" size="sm" className="text-red-700">
        {t("deleteDraft")}
      </Button>
    </form>
  );
}

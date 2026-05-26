"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, Spinner } from "@/components/ui/feedback";
import { isNextRedirect } from "@/lib/app-errors";
import { deleteDraftListingAction } from "@/lib/listings/actions";

type Props = {
  listingId: string;
};

export function DeleteDraftButton({ listingId }: Props) {
  const t = useTranslations("dashboard.listings");
  const tErrors = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(t("deleteConfirm"))) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteDraftListingAction(listingId);
        if (!result.ok) {
          setError(tErrors(result.error));
        }
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        setError(tErrors("SERVER_ERROR"));
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <Alert>{error}</Alert>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-red-700 sm:w-auto"
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? (
          <>
            <Spinner size="sm" className="me-2" />
            {t("deleteDraft")}
          </>
        ) : (
          t("deleteDraft")
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, Spinner } from "@/components/ui/feedback";
import { isNextRedirect } from "@/lib/app-errors";
import { submitListingAction } from "@/lib/listings/actions";

type Props = {
  listingId: string;
  label: string;
};

export function SubmitListingButton({ listingId, label }: Props) {
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitListingAction(listingId);
        if (!result.ok) {
          setError(tErrors(result.error));
          return;
        }
        router.refresh();
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        setError(tErrors("SERVER_ERROR"));
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <Alert>{error}</Alert>}
      <Button type="button" onClick={handleSubmit} disabled={pending}>
        {pending ? (
          <>
            <Spinner size="sm" className="me-2" />
            {label}
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}

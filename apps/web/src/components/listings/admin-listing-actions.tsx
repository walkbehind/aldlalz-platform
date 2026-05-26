"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";
import { isNextRedirect } from "@/lib/app-errors";
import {
  approveListingAction,
  rejectListingAction,
} from "@/lib/listings/actions";

type Props = {
  listingId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export function AdminListingActions({ listingId, status }: Props) {
  const t = useTranslations("admin.listings");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (status !== "PENDING") return null;

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) {
          setError(tErrors(result.error ?? "SERVER_ERROR"));
          return;
        }
        setShowReject(false);
        setReason("");
        router.refresh();
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        setError(tErrors("SERVER_ERROR"));
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:min-w-[220px]">
      {error && <Alert>{error}</Alert>}

      <Button
        type="button"
        size="sm"
        disabled={pending}
        className="w-full sm:w-auto"
        onClick={() => runAction(() => approveListingAction(listingId))}
      >
        {pending && !showReject ? (
          <>
            <Spinner size="sm" className="me-2" />
            {t("approve")}
          </>
        ) : (
          t("approve")
        )}
      </Button>

      {!showReject ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-red-700 sm:w-auto"
          disabled={pending}
          onClick={() => setShowReject(true)}
        >
          {t("reject")}
        </Button>
      ) : (
        <div className="space-y-2 rounded-lg border border-border bg-surface-muted/50 p-3">
          <Label htmlFor={`reason-${listingId}`}>{t("rejectReason")}</Label>
          <Textarea
            id={`reason-${listingId}`}
            name="reason"
            required
            minLength={3}
            dir="auto"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || reason.trim().length < 3}
              onClick={() => {
                const fd = new FormData();
                fd.set("reason", reason);
                runAction(() => rejectListingAction(listingId, fd));
              }}
            >
              {pending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {t("confirmReject")}
                </>
              ) : (
                t("confirmReject")
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setShowReject(false);
                setReason("");
                setError(null);
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

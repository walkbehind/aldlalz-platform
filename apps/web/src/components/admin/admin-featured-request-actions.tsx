"use client";

import { useTransition, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  approveFeaturedRequestAction,
  confirmFeaturedPaymentAction,
  activateFeaturedRequestAction,
  rejectFeaturedRequestAction,
} from "@/lib/featured/actions";

type Props = {
  requestId: string;
  status: string;
  labels: {
    approve: string;
    confirmPayment: string;
    activate: string;
    reject: string;
    rejectReason: string;
    confirmReject: string;
  };
};

export function AdminFeaturedRequestActions({
  requestId,
  status,
  labels,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  function run(fn: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={labels.rejectReason}
          className="min-h-20 rounded-lg border border-border px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => setShowReject(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || reason.trim().length < 3}
            onClick={() =>
              run(() => rejectFeaturedRequestAction(requestId, reason))
            }
          >
            {labels.confirmReject}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => run(() => approveFeaturedRequestAction(requestId))}
          >
            {labels.approve}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => setShowReject(true)}
          >
            {labels.reject}
          </Button>
        </>
      )}
      {status === "APPROVED" && (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => run(() => confirmFeaturedPaymentAction(requestId))}
        >
          {labels.confirmPayment}
        </Button>
      )}
      {status === "PAYMENT_CONFIRMED" && (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => run(() => activateFeaturedRequestAction(requestId))}
        >
          {labels.activate}
        </Button>
      )}
    </div>
  );
}

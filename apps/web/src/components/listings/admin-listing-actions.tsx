"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveListingAction,
  rejectListingAction,
} from "@/lib/listings/actions";
import { useState } from "react";

type Props = {
  listingId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export function AdminListingActions({ listingId, status }: Props) {
  const t = useTranslations("admin.listings");
  const [showReject, setShowReject] = useState(false);

  if (status !== "PENDING") return null;

  return (
    <div className="flex flex-col gap-3">
      <form action={approveListingAction.bind(null, listingId)}>
        <Button type="submit" size="sm">
          {t("approve")}
        </Button>
      </form>

      {!showReject ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-700"
          onClick={() => setShowReject(true)}
        >
          {t("reject")}
        </Button>
      ) : (
        <form
          action={rejectListingAction.bind(null, listingId)}
          className="space-y-2"
        >
          <Label htmlFor={`reason-${listingId}`}>{t("rejectReason")}</Label>
          <Textarea
            id={`reason-${listingId}`}
            name="reason"
            required
            dir="auto"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="outline">
              {t("confirmReject")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowReject(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

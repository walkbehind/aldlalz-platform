"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toggleListingFeaturedAction } from "@/lib/listings/actions";

type Props = {
  listingId: string;
  isFeatured: boolean;
};

export function ToggleFeaturedButton({ listingId, isFeatured }: Props) {
  const t = useTranslations("admin.listings");

  return (
    <form action={toggleListingFeaturedAction.bind(null, listingId)}>
      <Button type="submit" size="sm" variant={isFeatured ? "primary" : "outline"}>
        {isFeatured ? t("unfeature") : t("feature")}
      </Button>
    </form>
  );
}

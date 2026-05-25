import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOwnerListings } from "@/lib/listings/queries";
import { ListingStatusBadge } from "@/components/listings/listing-status-badge";
import { DeleteDraftButton } from "@/components/listings/delete-draft-button";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
} from "@/lib/listings/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function MyListingsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("dashboard.listings");
  const listings = await getOwnerListings(session.user.id);

  return (
    <Container>
      <PageHeader
        title={t("title")}
        subtitle={
          query.submitted ? t("submittedNotice") : t("subtitle")
        }
        actions={
          <Link href="/dashboard/listings/new">
            <Button size="sm">{t("create")}</Button>
          </Link>
        }
      />

      {listings.length === 0 ? (
        <Card>
          <p className="text-text-muted">{t("empty")}</p>
          <Link href="/dashboard/listings/new" className="mt-4 inline-block">
            <Button>{t("createFirst")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const title =
              locale === "ar"
                ? listing.titleAr
                : listing.titleEn || listing.titleAr;

            return (
              <Card key={listing.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <ListingStatusBadge
                      status={listing.adminStatus}
                      locale={locale}
                      draft={listing.isDraft}
                      draftLabel={t("draft")}
                    />
                  </div>
                  <p className="text-sm text-text-muted">
                    {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} —{" "}
                    {listing.area}
                  </p>
                  <p className="mt-1 font-medium text-brand-600">
                    {formatPriceKwd(listing.priceKwd.toString(), locale)}
                  </p>
                  {listing.rejectionReason && (
                    <p className="mt-2 text-sm text-red-700">
                      {t("rejectionReason")}: {listing.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Button variant="outline" size="sm">
                      {t("edit")}
                    </Button>
                  </Link>
                  {listing.isDraft && (
                    <DeleteDraftButton listingId={listing.id} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}

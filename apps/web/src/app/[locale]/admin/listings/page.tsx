import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminListingActions } from "@/components/listings/admin-listing-actions";
import { ToggleFeaturedButton } from "@/components/listings/toggle-featured-button";
import { ListingStatusBadge } from "@/components/listings/listing-status-badge";
import {
  getAdminListingCounts,
  getAdminListings,
} from "@/lib/listings/queries";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
} from "@/lib/listings/constants";
import type { AdminStatus } from "@aldlalz/database";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

const TABS: AdminStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function AdminListingsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { status: statusParam } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const status = TABS.includes(statusParam as AdminStatus)
    ? (statusParam as AdminStatus)
    : "PENDING";

  const t = await getTranslations("admin.listings");
  const counts = await getAdminListingCounts();
  const listings = await getAdminListings(status);

  return (
    <Container>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link key={tab} href={`/admin/listings?status=${tab}`}>
            <Button
              variant={status === tab ? "primary" : "secondary"}
              size="sm"
            >
              {t(`tabs.${tab.toLowerCase()}`)} (
              {tab === "PENDING"
                ? counts.pending
                : tab === "APPROVED"
                  ? counts.approved
                  : counts.rejected}
              )
            </Button>
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <Card>
          <p className="text-text-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const title =
              locale === "ar"
                ? listing.titleAr
                : listing.titleEn || listing.titleAr;
            const ownerName =
              locale === "ar"
                ? listing.owner.nameAr || listing.owner.nameEn
                : listing.owner.nameEn || listing.owner.nameAr;

            return (
              <Card
                key={listing.id}
                className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <ListingStatusBadge
                      status={listing.adminStatus}
                      locale={locale}
                    />
                  </div>
                  <p className="text-sm text-text-muted">
                    {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} —{" "}
                    {listing.area}
                  </p>
                  <p className="mt-1 font-medium text-brand-600">
                    {formatPriceKwd(listing.priceKwd.toString(), locale)}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    {t("owner")}: {ownerName ?? listing.owner.email}
                  </p>
                  {listing.rejectionReason && (
                    <p className="mt-2 text-sm text-red-700">
                      {t("rejectReason")}: {listing.rejectionReason}
                    </p>
                  )}
                  {listing.adminStatus === "APPROVED" && (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="mt-3 inline-block text-sm text-brand-600 hover:underline"
                    >
                      {t("viewPublic")}
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {listing.adminStatus === "APPROVED" && (
                    <ToggleFeaturedButton
                      listingId={listing.id}
                      isFeatured={listing.isFeatured}
                    />
                  )}
                  <AdminListingActions
                    listingId={listing.id}
                    status={listing.adminStatus}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}

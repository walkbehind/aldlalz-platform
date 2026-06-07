import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { RequestFeaturedButton } from "@/components/featured/request-featured-button";
import { listOwnerFeaturedRequests } from "@/lib/featured/queries";
import { getOwnerListings } from "@/lib/listings/queries";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function DashboardFeaturedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return redirect({ href: "/login", locale });

  const t = await getTranslations("dashboard.featured");
  const [requests, listings] = await Promise.all([
    listOwnerFeaturedRequests(session.user.id),
    getOwnerListings(session.user.id),
  ]);

  const approved = listings.filter(
    (l) => !l.isDraft && l.adminStatus === "APPROVED"
  );

  const featureLabels = {
    requestFeatured: t("requestFeatured"),
    selectType: t("selectType"),
    DAYS_3: t("types.DAYS_3"),
    DAYS_7: t("types.DAYS_7"),
    DAYS_30: t("types.DAYS_30"),
  };

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-8">
        <h2 className="mb-2 font-semibold">{t("requestSection")}</h2>
        <p className="mb-4 text-sm text-text-muted">{t("requestHint")}</p>
        {approved.length === 0 ? (
          <EmptyState title={t("noApprovedListings")} />
        ) : (
          <ul className="divide-y divide-border">
            {approved.map((listing) => {
              const title =
                locale === "ar"
                  ? listing.titleAr
                  : listing.titleEn || listing.titleAr;
              return (
                <li
                  key={listing.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{title}</p>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {t("viewPublic")}
                    </Link>
                  </div>
                  <RequestFeaturedButton
                    listingId={listing.id}
                    labels={featureLabels}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold">{t("myRequests")}</h2>
        {requests.length === 0 ? (
          <EmptyState title={t("noRequests")} />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {requests.map((req) => (
              <li key={req.id} className="py-3">
                <p className="font-medium">
                  {locale === "ar"
                    ? req.listing.titleAr
                    : req.listing.titleEn || req.listing.titleAr}
                </p>
                <p className="text-text-muted">
                  {t(`statuses.${req.status}`)} · {req.durationType}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

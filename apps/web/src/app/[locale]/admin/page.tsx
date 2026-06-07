import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminListingCounts } from "@/lib/listings/queries";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  const user = session.user;
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin");
  const tabs = await getTranslations("admin.listings.tabs");
  const counts = await getAdminListingCounts();

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <Link href="/admin/listings?status=PENDING" className="block">
          <StatCard
            label={tabs("pending")}
            value={counts.pending}
            tone="gold"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />
        </Link>
        <Link href="/admin/listings?status=APPROVED" className="block">
          <StatCard
            label={tabs("approved")}
            value={counts.approved}
            tone="success"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            }
          />
        </Link>
        <Link href="/admin/listings?status=REJECTED" className="block">
          <StatCard
            label={tabs("rejected")}
            value={counts.rejected}
            tone="neutral"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            }
          />
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">{t("listingsCard.title")}</h2>
        <p className="mt-2 text-sm text-text-muted">
          {t("listingsCard.description")}
        </p>
        <p className="mt-3 text-sm">
          {t("listingsCard.pending")}:{" "}
          <span className="font-semibold">{counts.pending}</span>
        </p>
        <Link href="/admin/listings" className="mt-4 inline-block">
          <Button size="sm">{t("listingsCard.review")}</Button>
        </Link>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h2 className="text-lg font-semibold">{t("usersCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("usersCard.description")}</p>
          <Link href="/admin/users" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">{t("usersCard.action")}</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t("subscriptionsCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("subscriptionsCard.description")}</p>
          <Link href="/admin/subscriptions" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">{t("subscriptionsCard.action")}</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t("plansCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("plansCard.description")}</p>
          <Link href="/admin/plans" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">{t("plansCard.action")}</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t("featuredCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("featuredCard.description")}</p>
          <Link href="/admin/featured" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">{t("featuredCard.action")}</Button>
          </Link>
        </Card>
      </div>
    </>
  );
}

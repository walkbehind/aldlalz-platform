import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { AdminFeaturedRequestActions } from "@/components/admin/admin-featured-request-actions";
import { listFeaturedRequests } from "@/lib/featured/queries";
import type { FeaturedRequestStatus } from "@aldlalz/database";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

const TABS: FeaturedRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "PAYMENT_CONFIRMED",
  "ACTIVE",
  "REJECTED",
];

export const dynamic = "force-dynamic";

export default async function AdminFeaturedPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { status: statusParam } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return redirect({ href: "/login", locale });
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const status = TABS.includes(statusParam as FeaturedRequestStatus)
    ? (statusParam as FeaturedRequestStatus)
    : "PENDING";

  const t = await getTranslations("admin.featured");
  const requests = await listFeaturedRequests(status);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link key={tab} href={`/admin/featured?status=${tab}`}>
            <Button
              variant={status === tab ? "primary" : "secondary"}
              size="sm"
            >
              {t(`tabs.${tab}`)}
            </Button>
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const title =
              locale === "ar"
                ? req.listing.titleAr
                : req.listing.titleEn || req.listing.titleAr;
            return (
              <Card key={req.id} className="space-y-3">
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-text-muted" dir="ltr">
                    {req.user.email} · {req.placementType} · {req.durationType} ·{" "}
                    {req.durationDays} {t("days")}
                    {req.price != null && (
                      <> · {String(req.price)} {req.currency}</>
                    )}
                  </p>
                  <p className="text-xs text-text-subtle">
                    {t("status")}: {t(`statuses.${req.status}`)}
                  </p>
                </div>
                <AdminFeaturedRequestActions
                  requestId={req.id}
                  status={req.status}
                  labels={{
                    approve: t("approve"),
                    confirmPayment: t("confirmPayment"),
                    activate: t("activate"),
                    reject: t("reject"),
                    rejectReason: t("rejectReason"),
                    confirmReject: t("confirmReject"),
                  }}
                />
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

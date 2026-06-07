import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { listUserSubscriptions, getEffectiveSubscriptionStatus } from "@/lib/subscriptions/queries";
import { CancelSubscriptionButton } from "@/components/admin/cancel-subscription-button";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminSubscriptionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin.subscriptions");
  const subscriptions = await listUserSubscriptions();

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {subscriptions.length === 0 ? (
        <Card>{t("empty")}</Card>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-muted text-start text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">{t("user")}</th>
                <th className="px-4 py-3">{t("plan")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("listings")}</th>
                <th className="px-4 py-3">{t("expires")}</th>
                <th className="px-4 py-3">{t("provider")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => {
                const effectiveStatus = getEffectiveSubscriptionStatus(sub);
                return (
                <tr key={sub.id}>
                  <td className="px-4 py-3" dir="ltr">
                    {sub.user.email}
                  </td>
                  <td className="px-4 py-3">
                    {locale === "ar"
                      ? sub.plan.nameAr
                      : sub.plan.nameEn ?? sub.plan.nameAr}
                  </td>
                  <td className="px-4 py-3">{t(`statuses.${effectiveStatus}`)}</td>
                  <td className="px-4 py-3">{sub.maxListings}</td>
                  <td className="px-4 py-3">
                    {sub.expiresAt.toLocaleDateString(
                      locale === "ar" ? "ar-KW" : "en-KW"
                    )}
                  </td>
                  <td className="px-4 py-3">{sub.billingProvider}</td>
                  <td className="px-4 py-3">
                    {effectiveStatus === "ACTIVE" && (
                      <CancelSubscriptionButton
                        subscriptionId={sub.id}
                        label={t("cancel")}
                      />
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

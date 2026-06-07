import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { listPlansForAdmin } from "@/lib/admin/plan-actions";
import { PlanEditorForm } from "@/components/admin/plan-editor-form";
import { TogglePlanButton } from "@/components/admin/toggle-plan-button";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function AdminPlansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return redirect({ href: "/login", locale });
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin.plans");
  const plans = await listPlansForAdmin();

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t("create")}</h2>
        <PlanEditorForm labels={t.raw("form") as Record<string, string>} />
      </Card>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">
                  {locale === "ar" ? plan.nameAr : plan.nameEn ?? plan.nameAr}
                </h3>
                <p className="text-sm text-text-muted">
                  {plan.slug} · {plan.maxListings} {t("listings")} ·{" "}
                  {plan.durationDays} {t("days")} · {Number(plan.priceKwd)} KWD
                </p>
              </div>
              <TogglePlanButton planId={plan.id} isActive={plan.isActive} />
            </div>
            <PlanEditorForm
              plan={plan}
              labels={t.raw("form") as Record<string, string>}
            />
          </Card>
        ))}
      </div>
    </>
  );
}

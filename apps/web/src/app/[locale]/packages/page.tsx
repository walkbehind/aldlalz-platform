import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { listActivePlans, getActiveSubscription } from "@/lib/subscriptions/queries";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function PackagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("packages");
  const session = await auth();

  const plans = await listActivePlans();
  const activeSub = session?.user?.id
    ? await getActiveSubscription(session.user.id)
    : null;

  return (
    <Container>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {activeSub && (
        <Card className="mb-6 border-brand-200 bg-brand-50">
          <CardDescription className="text-brand-700">
            {t("currentPlan")}:{" "}
            {locale === "ar"
              ? activeSub.planNameAr
              : activeSub.planNameEn ?? activeSub.planNameAr}
            {" · "}
            {t("listingsLimit", { count: activeSub.maxListings })}
          </CardDescription>
        </Card>
      )}

      {plans.length === 0 ? (
        <Card>
          <p className="text-center text-text-muted">{t("empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const name = locale === "ar" ? plan.nameAr : plan.nameEn ?? plan.nameAr;
            const desc =
              locale === "ar"
                ? plan.descriptionAr
                : plan.descriptionEn ?? plan.descriptionAr;
            const isCurrent = activeSub?.planId === plan.id;

            return (
              <Card key={plan.id} className="flex flex-col">
                <CardTitle>{name}</CardTitle>
                {desc && (
                  <CardDescription className="mt-2">{desc}</CardDescription>
                )}
                <CardDescription className="mt-2 flex-1 space-y-1">
                  <span className="block">
                    {Number(plan.priceKwd)} KWD · {plan.durationDays}{" "}
                    {locale === "ar" ? "يوم" : "days"}
                  </span>
                  <span className="block">
                    {t("listingsLimit", { count: plan.maxListings })}
                  </span>
                  {plan.includedFeatureCredits > 0 && (
                    <span className="block">
                      {t("featureCredits", {
                        count: plan.includedFeatureCredits,
                      })}
                    </span>
                  )}
                </CardDescription>
                {isCurrent ? (
                  <Button className="mt-4 w-full" disabled>
                    {t("currentPlan")}
                  </Button>
                ) : (
                  <Link href={session?.user ? "/dashboard/profile" : "/register"}>
                    <Button className="mt-4 w-full" variant="secondary">
                      {t("contactAdmin")}
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-text-muted">{t("featuredNote")}</p>
    </Container>
  );
}

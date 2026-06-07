import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { listActivePackages, getActiveSubscription } from "@/lib/subscriptions/queries";

type Props = { params: Promise<{ locale: string }> };

export default async function PackagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("packages");
  const common = await getTranslations("common");
  const session = await auth();

  const packages = await listActivePackages();
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
              ? activeSub.packageNameAr
              : activeSub.packageNameEn ?? activeSub.packageNameAr}
          </CardDescription>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => {
          const name = locale === "ar" ? pkg.nameAr : pkg.nameEn ?? pkg.nameAr;
          const desc =
            locale === "ar" ? pkg.descriptionAr : pkg.descriptionEn ?? pkg.descriptionAr;
          const isCurrent = activeSub?.packageId === pkg.id;

          return (
            <Card key={pkg.id} className="flex flex-col">
              <CardTitle>{name}</CardTitle>
              {desc && (
                <CardDescription className="mt-2">{desc}</CardDescription>
              )}
              <CardDescription className="mt-2 flex-1">
                {Number(pkg.priceKwd)} KWD · {pkg.maxListings}{" "}
                {locale === "ar" ? "عقار" : "listings"} · {pkg.durationDays}{" "}
                {locale === "ar" ? "يوم" : "days"}
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

      {packages.length === 0 && (
        <p className="text-center text-text-muted">{common("loading")}</p>
      )}
    </Container>
  );
}

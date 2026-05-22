import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ locale: string }> };

const PLACEHOLDER_PACKAGES = [
  { nameAr: "أساسية", nameEn: "Basic", price: 5, listings: 5 },
  { nameAr: "محترفين", nameEn: "Pro", price: 10, listings: 15 },
  { nameAr: "كبار الشخصيات", nameEn: "VIP", price: 20, listings: 50 },
];

export default async function PackagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("packages");
  const common = await getTranslations("common");

  return (
    <Container>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        badge={common("phase1")}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {PLACEHOLDER_PACKAGES.map((pkg) => (
          <Card key={pkg.nameEn} className="flex flex-col">
            <CardTitle>{locale === "ar" ? pkg.nameAr : pkg.nameEn}</CardTitle>
            <CardDescription className="mt-2 flex-1">
              {pkg.price} KWD · {pkg.listings}{" "}
              {locale === "ar" ? "عقار" : "listings"}
            </CardDescription>
            <Button className="mt-4 w-full" disabled>
              {locale === "ar" ? "قريباً" : "Coming soon"}
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  );
}

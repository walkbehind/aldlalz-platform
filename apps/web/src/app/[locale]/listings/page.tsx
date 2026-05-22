import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ locale: string }> };

const PLACEHOLDER_LISTINGS = [
  { id: "1", titleAr: "شقة في السالمية", titleEn: "Apartment in Salmiya", type: "RENT" },
  { id: "2", titleAr: "فيلا للبيع — حولي", titleEn: "Villa for sale — Hawally", type: "SALE" },
  { id: "3", titleAr: "استراحة للحجز", titleEn: "Chalet booking", type: "BOOKING" },
];

export default async function ListingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("listings");
  const common = await getTranslations("common");

  return (
    <Container>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        badge={common("phase1")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_LISTINGS.map((listing) => (
          <Card key={listing.id}>
            <CardTitle>
              {locale === "ar" ? listing.titleAr : listing.titleEn}
            </CardTitle>
            <CardDescription>{listing.type}</CardDescription>
            <Link href={`/listings/${listing.id}`} className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                {t("viewDetails")}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </Container>
  );
}

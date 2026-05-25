import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ListingForm } from "@/components/listings/listing-form";
import { createListingAction } from "@/lib/listings/actions";

type Props = { params: Promise<{ locale: string }> };

export default async function NewListingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("dashboard.listings.form");

  const labels = {
    listingType: t("listingType"),
    propertyType: t("propertyType"),
    titleAr: t("titleAr"),
    titleEn: t("titleEn"),
    descriptionAr: t("descriptionAr"),
    descriptionEn: t("descriptionEn"),
    priceKwd: t("priceKwd"),
    paciNumber: t("paciNumber"),
    governorate: t("governorate"),
    area: t("area"),
    selectArea: t("selectArea"),
    bedrooms: t("bedrooms"),
    bathrooms: t("bathrooms"),
    parking: t("parking"),
    sizeM2: t("sizeM2"),
  };

  return (
    <Container>
      <PageHeader
        title={t("createTitle")}
        subtitle={t("createSubtitle")}
      />
      <Card>
        <ListingForm
          locale={locale}
          labels={labels}
          action={createListingAction}
          submitLabel={t("saveDraft")}
        />
      </Card>
    </Container>
  );
}

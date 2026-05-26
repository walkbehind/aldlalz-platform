import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewListingFlow } from "@/components/listings/new-listing-flow";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function NewListingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("dashboard.listings.form");
  const listings = await getTranslations("dashboard.listings");
  const tr = await getTranslations("dashboard.listings.translation");

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

  const translationLabels = {
    title: tr("title"),
    description: tr("description"),
    primaryHint:
      locale === "ar" ? tr("primaryHintAr") : tr("primaryHintEn"),
    autoFilled: tr("autoFilled"),
    translating: tr("translating"),
    translateNow: tr("translateNow"),
    editTranslation: tr("editTranslation"),
    translationPreviewAr: tr("translationPreviewAr"),
    translationPreviewEn: tr("translationPreviewEn"),
    translationFailed: tr("translationFailed"),
    notConfigured: tr("notConfigured"),
    titleAr: t("titleAr"),
    titleEn: t("titleEn"),
    descriptionAr: t("descriptionAr"),
    descriptionEn: t("descriptionEn"),
  };

  return (
    <Container>
      <PageHeader
        title={t("createTitle")}
        subtitle={t("createSubtitle")}
      />
      <NewListingFlow
        locale={locale}
        labels={labels}
        translationLabels={translationLabels}
        submitLabel={t("saveDraft")}
        mediaTitle={listings("mediaTitle")}
        photosHint={t("photosHint")}
        photosAfterSave={t("photosAfterSave")}
        continueEditing={t("continueEditing")}
      />
    </Container>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { NewListingFlow } from "@/components/listings/new-listing-flow";
import { Icon } from "@/components/ui/icon";
import {
  googleMapsConfigured,
  getGoogleMapsApiKey,
} from "@/lib/maps/kuwait";

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
  const map = await getTranslations("dashboard.listings.map");
  const tr = await getTranslations("dashboard.listings.translation");
  const wiz = await getTranslations("dashboard.listings.wizard");

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

  const wizardLabels = {
    detailsStep: wiz("detailsStep"),
    detailsDesc: wiz("detailsDesc"),
    photosStep: wiz("photosStep"),
    photosDesc: wiz("photosDesc"),
    publishStep: wiz("publishStep"),
    publishDesc: wiz("publishDesc"),
    stepLabel: wiz("stepLabel"),
    savedBadge: wiz("savedBadge"),
    createTitle: t("createTitle"),
    createSubtitle: t("createSubtitle"),
  };

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-brand-600"
        >
          <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
          {listings("backToList")}
        </Link>
      </div>
      <NewListingFlow
        locale={locale}
        labels={labels}
        translationLabels={translationLabels}
        wizardLabels={wizardLabels}
        submitLabel={t("saveDraft")}
        mediaTitle={listings("mediaTitle")}
        photosHint={t("photosHint")}
        photosAfterSave={t("photosAfterSave")}
        continueEditing={t("continueEditing")}
        mapsApiKey={
          googleMapsConfigured() ? getGoogleMapsApiKey() : undefined
        }
        mapLabels={{
          title: map("title"),
          hint: map("hint"),
          addressLine: map("addressLine"),
          latitude: map("latitude"),
          longitude: map("longitude"),
          useMyLocation: map("useMyLocation"),
          clearPin: map("clearPin"),
          locationDenied: map("locationDenied"),
        }}
        mapsNotConfigured={map("notConfigured")}
      />
    </>
  );
}

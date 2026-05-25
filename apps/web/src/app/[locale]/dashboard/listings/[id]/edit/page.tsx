import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingStatusBadge } from "@/components/listings/listing-status-badge";
import { DeleteDraftButton } from "@/components/listings/delete-draft-button";
import { ListingMediaUploader } from "@/components/listings/listing-media-uploader";
import { getOwnerListing } from "@/lib/listings/queries";
import { toListingImageDto } from "@/lib/listings/images";
import {
  submitListingAction,
  updateListingAndRedirectAction,
} from "@/lib/listings/actions";
import { isStorageConfigured } from "@/lib/storage";
import { googleMapsConfigured, getGoogleMapsApiKey } from "@/lib/maps/kuwait";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
};

export default async function EditListingPage({
  params,
  searchParams,
}: Props) {
  const { locale, id } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const listing = await getOwnerListing(session.user.id, id);
  if (!listing) notFound();

  const t = await getTranslations("dashboard.listings");
  const form = await getTranslations("dashboard.listings.form");
  const map = await getTranslations("dashboard.listings.map");

  const labels = {
    listingType: form("listingType"),
    propertyType: form("propertyType"),
    titleAr: form("titleAr"),
    titleEn: form("titleEn"),
    descriptionAr: form("descriptionAr"),
    descriptionEn: form("descriptionEn"),
    priceKwd: form("priceKwd"),
    paciNumber: form("paciNumber"),
    governorate: form("governorate"),
    area: form("area"),
    selectArea: form("selectArea"),
    bedrooms: form("bedrooms"),
    bathrooms: form("bathrooms"),
    parking: form("parking"),
    sizeM2: form("sizeM2"),
  };

  const mapLabels = {
    title: map("title"),
    hint: map("hint"),
    addressLine: map("addressLine"),
    latitude: map("latitude"),
    longitude: map("longitude"),
  };

  return (
    <Container>
      <PageHeader
        title={t("editTitle")}
        subtitle={
          query.created
            ? t("createdNotice")
            : query.saved
              ? t("savedNotice")
              : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ListingStatusBadge
          status={listing.adminStatus}
          locale={locale}
          draft={listing.isDraft}
          draftLabel={t("draft")}
        />
        <Link href="/dashboard/listings">
          <Button variant="ghost" size="sm">
            {t("backToList")}
          </Button>
        </Link>
        {listing.isDraft && <DeleteDraftButton listingId={listing.id} />}
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold">{t("mediaTitle")}</h2>
        <ListingMediaUploader
          listingId={listing.id}
          initialImages={listing.images.map(toListingImageDto)}
          storageConfigured={isStorageConfigured()}
        />
      </Card>

      <Card className="mb-6">
        <ListingForm
          locale={locale}
          labels={labels}
          action={updateListingAndRedirectAction.bind(null, id)}
          listing={listing}
          submitLabel={t("saveChanges")}
          mapsApiKey={
            googleMapsConfigured() ? getGoogleMapsApiKey() : undefined
          }
          mapLabels={mapLabels}
        />
      </Card>

      {listing.isDraft && (
        <Card>
          <h2 className="mb-2 text-lg font-semibold">{t("submitTitle")}</h2>
          <p className="mb-4 text-sm text-text-muted">{t("submitHint")}</p>
          <form action={submitListingAction.bind(null, id)}>
            <Button type="submit">{t("submitForReview")}</Button>
          </form>
        </Card>
      )}

      {!listing.isDraft && listing.adminStatus === "REJECTED" && (
        <Card className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">{t("resubmitTitle")}</h2>
          <p className="mb-4 text-sm text-text-muted">{t("resubmitHint")}</p>
          <form action={submitListingAction.bind(null, id)}>
            <Button type="submit">{t("resubmit")}</Button>
          </form>
        </Card>
      )}
    </Container>
  );
}

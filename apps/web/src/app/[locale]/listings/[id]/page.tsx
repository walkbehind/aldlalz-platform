import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPublicListingById } from "@/lib/listings/queries";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings/constants";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const listing = await getPublicListingById(id);
  if (!listing) notFound();

  const t = await getTranslations("listingDetail");
  const common = await getTranslations("common");

  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const description =
    locale === "ar"
      ? listing.descriptionAr
      : listing.descriptionEn || listing.descriptionAr;

  return (
    <Container>
      <PageHeader title={title} subtitle={t("title")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>
              {labelFor(LISTING_TYPE_LABELS, listing.listingType, locale)}
            </Badge>
            <Badge className="bg-surface-muted text-text-muted">
              {labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale)}
            </Badge>
          </div>

          <p className="text-3xl font-bold text-brand-600">
            {formatPriceKwd(listing.priceKwd.toString(), locale)}
          </p>

          <p className="mt-4 text-text-muted">
            {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} —{" "}
            {listing.area}
          </p>

          {description && (
            <div className="mt-6 whitespace-pre-wrap leading-relaxed">
              {description}
            </div>
          )}

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {listing.bedrooms != null && (
              <div>
                <dt className="text-sm text-text-muted">{t("bedrooms")}</dt>
                <dd className="font-medium">{listing.bedrooms}</dd>
              </div>
            )}
            {listing.bathrooms != null && (
              <div>
                <dt className="text-sm text-text-muted">{t("bathrooms")}</dt>
                <dd className="font-medium">{listing.bathrooms}</dd>
              </div>
            )}
            {listing.parking != null && (
              <div>
                <dt className="text-sm text-text-muted">{t("parking")}</dt>
                <dd className="font-medium">{listing.parking}</dd>
              </div>
            )}
            {listing.sizeM2 != null && (
              <div>
                <dt className="text-sm text-text-muted">{t("sizeM2")}</dt>
                <dd className="font-medium">{listing.sizeM2.toString()} m²</dd>
              </div>
            )}
            {listing.paciNumber && (
              <div>
                <dt className="text-sm text-text-muted">{t("paciNumber")}</dt>
                <dd className="font-medium">{listing.paciNumber}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">{t("contact")}</h2>
          <p className="text-sm text-text-muted">
            {locale === "ar"
              ? listing.owner.nameAr || listing.owner.nameEn
              : listing.owner.nameEn || listing.owner.nameAr}
          </p>
          {listing.owner.phone && (
            <a
              href={`tel:${listing.owner.phone}`}
              className="mt-3 inline-block text-brand-600 hover:underline"
              dir="ltr"
            >
              {listing.owner.phone}
            </a>
          )}
          <Link href="/listings" className="mt-6 inline-block">
            <Button variant="secondary">{common("backToListings")}</Button>
          </Link>
        </Card>
      </div>
    </Container>
  );
}

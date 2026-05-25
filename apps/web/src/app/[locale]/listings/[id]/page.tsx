import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingMapDisplay } from "@/components/listings/listing-map-display";
import { ListingContactCard } from "@/components/listings/listing-contact-card";
import { ListingCard } from "@/components/listings/listing-card";
import {
  getPublicListingById,
  getPublicListingForMetadata,
  getSimilarListings,
} from "@/lib/listings/queries";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings/constants";
import { getCoverImage } from "@/lib/listings/images";
import { getThumbnailStorageUrl } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const listing = await getPublicListingForMetadata(id);
  if (!listing) {
    return { title: locale === "ar" ? "عقار غير موجود" : "Listing not found" };
  }

  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const description =
    locale === "ar"
      ? listing.descriptionAr?.slice(0, 160)
      : listing.descriptionEn?.slice(0, 160) ||
        listing.descriptionAr?.slice(0, 160);

  const cover = getCoverImage(listing.images);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title,
    description:
      description ??
      `${title} — ${labelFor(GOVERNORATE_LABELS, listing.governorate, locale)}`,
    openGraph: {
      title,
      description: description ?? undefined,
      type: "website",
      locale: locale === "ar" ? "ar_KW" : "en_KW",
      url: `${appUrl}/${locale}/listings/${id}`,
      images: cover ? [{ url: cover.url, alt: title }] : [],
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description: description ?? undefined,
      images: cover ? [cover.url] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const listing = await getPublicListingById(id);
  if (!listing) notFound();

  const t = await getTranslations("listingDetail");
  const common = await getTranslations("common");
  const similar = await getSimilarListings(listing);

  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const description =
    locale === "ar"
      ? listing.descriptionAr
      : listing.descriptionEn || listing.descriptionAr;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const listingUrl = `${appUrl}/${locale}/listings/${id}`;

  const lat =
    listing.latitude != null ? Number(listing.latitude.toString()) : null;
  const lng =
    listing.longitude != null ? Number(listing.longitude.toString()) : null;

  return (
    <Container className="pb-12">
      <div className="mb-6 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <ListingGallery
            images={listing.images.map((img) => ({
              id: img.id,
              url: img.url,
              thumbUrl: getThumbnailStorageUrl(img.storagePath),
              width: img.width,
              height: img.height,
            }))}
            title={title}
          />

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>
                {labelFor(LISTING_TYPE_LABELS, listing.listingType, locale)}
              </Badge>
              <Badge className="bg-surface-muted text-text-muted">
                {labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale)}
              </Badge>
              {listing.isFeatured && (
                <Badge className="bg-brand-600 text-white">
                  {t("featured")}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>

            <p className="mt-3 text-3xl font-bold text-brand-600">
              {formatPriceKwd(listing.priceKwd.toString(), locale)}
            </p>

            <p className="mt-2 text-text-muted">
              {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} —{" "}
              {listing.area}
            </p>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <ListingContactCard
            owner={listing.owner}
            locale={locale}
            listingTitle={title}
            listingUrl={listingUrl}
            labels={{
              contact: t("contact"),
              call: t("call"),
              whatsapp: t("whatsapp"),
              ownerProfile: t("ownerProfile"),
              phoneMasked: t("phoneMasked"),
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {description && (
            <div className="mb-8 whitespace-pre-wrap leading-relaxed">
              <h2 className="mb-3 text-lg font-semibold">{t("description")}</h2>
              {description}
            </div>
          )}

          <dl className="grid gap-4 sm:grid-cols-2">
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

          {lat != null && lng != null && (
            <div className="mt-8">
              <ListingMapDisplay
                lat={lat}
                lng={lng}
                addressLine={listing.addressLine}
              />
            </div>
          )}
        </Card>

        <div className="lg:hidden">
          <Link href="/listings">
            <Button variant="secondary" className="w-full">
              {common("backToListings")}
            </Button>
          </Link>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{t("similar")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                locale={locale}
                viewDetailsLabel={t("viewDetails")}
              />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

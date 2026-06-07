import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingMapDisplay } from "@/components/listings/listing-map-display";
import { ListingContactCard } from "@/components/listings/listing-contact-card";
import { ListingShareButton } from "@/components/listings/listing-share-button";
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
import { getNearbyListingsForListing } from "@/lib/listings/nearby";
import { formatDistanceKm } from "@/lib/maps/geo";

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
  const similar = await getSimilarListings(listing);
  const nearby =
    listing.latitude != null && listing.longitude != null
      ? await getNearbyListingsForListing(listing)
      : [];

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

  const highlights: { icon: IconName; label: string; value: string }[] = [];
  if (listing.bedrooms != null)
    highlights.push({
      icon: "bed",
      label: t("bedrooms"),
      value: String(listing.bedrooms),
    });
  if (listing.bathrooms != null)
    highlights.push({
      icon: "bath",
      label: t("bathrooms"),
      value: String(listing.bathrooms),
    });
  if (listing.sizeM2 != null)
    highlights.push({
      icon: "ruler",
      label: t("sizeM2"),
      value: `${listing.sizeM2.toString()} m²`,
    });
  if (listing.parking != null)
    highlights.push({
      icon: "car",
      label: t("parking"),
      value: String(listing.parking),
    });

  const details: { label: string; value: string }[] = [
    {
      label: t("propertyType"),
      value: labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale),
    },
    {
      label: t("listingType"),
      value: labelFor(LISTING_TYPE_LABELS, listing.listingType, locale),
    },
    {
      label: t("governorate"),
      value: labelFor(GOVERNORATE_LABELS, listing.governorate, locale),
    },
    { label: t("area"), value: listing.area },
  ];
  if (listing.paciNumber)
    details.push({ label: t("paciNumber"), value: listing.paciNumber });

  return (
    <Container className="pb-12">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-text-muted">
        <Link href="/listings" className="transition-colors hover:text-brand-600">
          {t("title")}
        </Link>
        <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
        <span className="line-clamp-1 text-text">{title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main column */}
        <div className="lg:col-span-2">
          <ListingGallery
            images={listing.images.map((img) => ({
              id: img.id,
              url: img.url,
              thumbUrl: img.url,
              width: img.width,
              height: img.height,
            }))}
            title={title}
          />

          {/* Title block */}
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="brand">
                {labelFor(LISTING_TYPE_LABELS, listing.listingType, locale)}
              </Badge>
              <Badge variant="neutral">
                {labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale)}
              </Badge>
              {listing.isFeatured && (
                <Badge variant="gold">
                  <Icon name="sparkles" size={12} />
                  {t("featured")}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-text-muted">
                  <Icon name="mapPin" size={18} className="text-brand-400" />
                  {listing.area} ·{" "}
                  {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)}
                </p>
              </div>
              <ListingShareButton
                title={title}
                url={listingUrl}
                shareLabel={t("share")}
                copiedLabel={t("shareCopied")}
              />
            </div>

            <p className="mt-4 text-3xl font-bold text-brand-600">
              {formatPriceKwd(listing.priceKwd.toString(), locale)}
            </p>
          </div>

          {/* Highlights bar */}
          {highlights.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="rounded-2xl border border-border bg-surface p-4 text-center shadow-[var(--shadow-xs)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={h.icon} size={20} />
                  </span>
                  <p className="mt-2 text-lg font-bold text-text">{h.value}</p>
                  <p className="text-xs text-text-muted">{h.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Mobile contact card */}
          <div className="mt-6 lg:hidden">
            <ListingContactCard
              owner={listing.owner}
              locale={locale}
              listingTitle={title}
              listingUrl={listingUrl}
              labels={{
                contact: t("contact"),
                interested: t("interested"),
                contactHint: t("contactHint"),
                verified: t("verified"),
                call: t("call"),
                whatsapp: t("whatsapp"),
                ownerProfile: t("ownerProfile"),
                phoneMasked: t("phoneMasked"),
              }}
            />
          </div>

          {/* Overview */}
          {description && (
            <Card className="mt-6">
              <h2 className="mb-3 text-lg font-bold">{t("overview")}</h2>
              <div className="whitespace-pre-wrap leading-relaxed text-text-muted">
                {description}
              </div>
            </Card>
          )}

          {/* Details */}
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-bold">{t("highlights")}</h2>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between border-b border-border pb-3"
                >
                  <dt className="text-sm text-text-muted">{d.label}</dt>
                  <dd className="font-semibold text-text">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Map */}
          {lat != null && lng != null && (
            <Card className="mt-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Icon name="mapPin" size={20} className="text-brand-500" />
                {t("location")}
              </h2>
              <ListingMapDisplay
                lat={lat}
                lng={lng}
                addressLine={listing.addressLine}
              />
            </Card>
          )}
        </div>

        {/* Sticky sidebar (desktop) */}
        <div className="mt-6 hidden lg:mt-0 lg:block">
          <ListingContactCard
            owner={listing.owner}
            locale={locale}
            listingTitle={title}
            listingUrl={listingUrl}
            labels={{
              contact: t("contact"),
              interested: t("interested"),
              contactHint: t("contactHint"),
              verified: t("verified"),
              call: t("call"),
              whatsapp: t("whatsapp"),
              ownerProfile: t("ownerProfile"),
              phoneMasked: t("phoneMasked"),
            }}
          />
        </div>
      </div>

      {nearby.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{t("nearby")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {nearby.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                locale={locale}
                viewDetailsLabel={t("viewDetails")}
                distanceLabel={formatDistanceKm(item.distanceKm, locale)}
              />
            ))}
          </div>
        </section>
      )}

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

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ListingCardData } from "@/lib/listings/queries";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/listings/constants";

type Props = {
  listing: ListingCardData;
  locale: string;
  viewDetailsLabel: string;
  featuredLabel?: string;
};

export function ListingCard({
  listing,
  locale,
  viewDetailsLabel,
  featuredLabel,
}: Props) {
  const title =
    locale === "ar"
      ? listing.titleAr
      : listing.titleEn || listing.titleAr;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[16/10] bg-surface-muted">
          {listing.coverImage ? (
            <Image
              src={listing.coverImage.url}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              —
            </div>
          )}
          {listing.isFeatured && featuredLabel && (
            <Badge className="absolute start-3 top-3 bg-brand-600 text-white">
              {featuredLabel}
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {labelFor(LISTING_TYPE_LABELS, listing.listingType, locale)}
          </span>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-text-muted">
            {labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale)}
          </span>
        </div>

        <CardTitle className="line-clamp-2">
          <Link href={`/listings/${listing.id}`} className="hover:text-brand-600">
            {title}
          </Link>
        </CardTitle>

        <p className="mt-2 text-lg font-bold text-brand-600">
          {formatPriceKwd(listing.priceKwd.toString(), locale)}
        </p>

        <CardDescription className="mt-2 flex-1">
          {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} —{" "}
          {listing.area}
        </CardDescription>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-muted">
          {listing.bedrooms != null && (
            <span>
              {listing.bedrooms} {locale === "ar" ? "غرف" : "beds"}
            </span>
          )}
          {listing.bathrooms != null && (
            <span>
              {listing.bathrooms} {locale === "ar" ? "حمام" : "baths"}
            </span>
          )}
          {listing.sizeM2 != null && (
            <span>{listing.sizeM2.toString()} m²</span>
          )}
        </div>

        <Link href={`/listings/${listing.id}`} className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            {viewDetailsLabel}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

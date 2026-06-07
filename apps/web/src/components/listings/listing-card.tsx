import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
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
  distanceLabel?: string;
};

export function ListingCard({
  listing,
  locale,
  featuredLabel,
  distanceLabel,
}: Props) {
  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;

  const beds = locale === "ar" ? "غرف" : "Beds";
  const baths = locale === "ar" ? "حمام" : "Baths";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block h-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        {listing.coverImage ? (
          <Image
            src={listing.coverImage.thumbUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-subtle">
            <Icon name="image" size={40} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="dark">
              {labelFor(LISTING_TYPE_LABELS, listing.listingType, locale)}
            </Badge>
            {listing.isFeatured && featuredLabel && (
              <Badge variant="gold">
                <Icon name="sparkles" size={12} />
                {featuredLabel}
              </Badge>
            )}
          </div>
          {distanceLabel && (
            <Badge variant="dark">
              <Icon name="mapPin" size={12} />
              {distanceLabel}
            </Badge>
          )}
        </div>

        <p className="absolute bottom-3 start-3 text-lg font-bold text-white drop-shadow-sm">
          {formatPriceKwd(listing.priceKwd.toString(), locale)}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            {labelFor(PROPERTY_TYPE_LABELS, listing.propertyType, locale)}
          </span>
          <h3 className="mt-0.5 line-clamp-1 text-base font-semibold text-text transition-colors group-hover:text-brand-600">
            {title}
          </h3>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-text-muted">
          <Icon name="mapPin" size={15} className="shrink-0 text-brand-400" />
          <span className="line-clamp-1">
            {listing.area} · {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)}
          </span>
        </p>

        {(listing.bedrooms != null ||
          listing.bathrooms != null ||
          listing.sizeM2 != null) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm text-text-muted">
            {listing.bedrooms != null && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="bed" size={16} className="text-brand-400" />
                {listing.bedrooms} {beds}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="bath" size={16} className="text-brand-400" />
                {listing.bathrooms} {baths}
              </span>
            )}
            {listing.sizeM2 != null && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="ruler" size={16} className="text-brand-400" />
                {listing.sizeM2.toString()} m²
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

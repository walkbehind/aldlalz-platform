import type { Listing, ListingImage, User } from "@aldlalz/database";
import { getCoverImage } from "@/lib/listings/images";
import { absoluteUrl } from "@/lib/seo/site";
import {
  GOVERNORATE_LABELS,
  labelFor,
  LISTING_TYPE_LABELS,
} from "@/lib/listings/constants";

type ListingWithOwner = Listing & {
  owner: Pick<User, "nameAr" | "nameEn">;
  images: ListingImage[];
};

type Props = {
  listing: ListingWithOwner;
  locale: string;
};

export function ListingJsonLd({ listing, locale }: Props) {
  const title =
    locale === "ar" ? listing.titleAr : listing.titleEn || listing.titleAr;
  const description =
    locale === "ar"
      ? listing.descriptionAr
      : listing.descriptionEn || listing.descriptionAr;
  const cover = getCoverImage(listing.images);
  const url = absoluteUrl(locale, `/listings/${listing.id}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: description ?? undefined,
    url,
    datePosted: listing.createdAt.toISOString(),
    offers: {
      "@type": "Offer",
      price: Number(listing.priceKwd.toString()),
      priceCurrency: "KWD",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.area,
      addressRegion: labelFor(GOVERNORATE_LABELS, listing.governorate, locale),
      addressCountry: "KW",
    },
    ...(listing.bedrooms != null && { numberOfRooms: listing.bedrooms }),
    ...(listing.sizeM2 != null && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: Number(listing.sizeM2.toString()),
        unitCode: "MTK",
      },
    }),
    ...(cover && { image: cover.url }),
    category: labelFor(LISTING_TYPE_LABELS, listing.listingType, locale),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

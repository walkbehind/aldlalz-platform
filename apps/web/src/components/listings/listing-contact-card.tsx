import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildListingWhatsAppMessage,
  buildTelUrl,
  buildWhatsAppUrl,
  displayOwnerName,
  maskPhone,
} from "@/lib/contact/phone";

type Owner = {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  phone?: string | null;
  image?: string | null;
  role?: string;
};

type Props = {
  owner: Owner;
  locale: string;
  listingTitle: string;
  listingUrl: string;
  labels: {
    contact: string;
    call: string;
    whatsapp: string;
    ownerProfile: string;
    phoneMasked: string;
  };
};

export function ListingContactCard({
  owner,
  locale,
  listingTitle,
  listingUrl,
  labels,
}: Props) {
  const name = displayOwnerName(owner, locale);
  const phone = owner.phone;
  const waMessage = buildListingWhatsAppMessage(listingTitle, listingUrl, locale);

  return (
    <Card className="sticky top-20">
      <h2 className="mb-4 text-lg font-semibold">{labels.contact}</h2>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-50">
          {owner.image ? (
            <Image
              src={owner.image}
              alt={name ?? labels.ownerProfile}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-600">
              {(name ?? "?").charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium">{name ?? labels.ownerProfile}</p>
          {owner.role && (
            <p className="text-xs text-text-muted">{owner.role}</p>
          )}
        </div>
      </div>

      {phone ? (
        <div className="space-y-3">
          <p className="text-sm text-text-muted" dir="ltr">
            {labels.phoneMasked}: {maskPhone(phone)}
          </p>
          <div className="flex flex-col gap-2">
            <a href={buildWhatsAppUrl(phone, waMessage)} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#1da851]">
                {labels.whatsapp}
              </Button>
            </a>
            <a href={buildTelUrl(phone)}>
              <Button variant="outline" className="w-full">
                {labels.call}
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted">{labels.phoneMasked}</p>
      )}
    </Card>
  );
}

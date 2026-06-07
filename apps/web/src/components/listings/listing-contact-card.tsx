import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
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
    interested?: string;
    contactHint?: string;
    verified?: string;
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
    <Card className="overflow-hidden p-0 lg:sticky lg:top-24">
      <div className="bg-brand-gradient px-5 py-5 text-white">
        <p className="text-sm font-medium text-brand-100">
          {labels.interested ?? labels.contact}
        </p>
        {labels.contactHint && (
          <p className="mt-0.5 text-xs text-brand-100/70">
            {labels.contactHint}
          </p>
        )}
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-50 ring-2 ring-gold-200">
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
            <p className="truncate font-semibold text-text">
              {name ?? labels.ownerProfile}
            </p>
            {labels.verified && (
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-success">
                <Icon name="verified" size={14} />
                {labels.verified}
              </span>
            )}
          </div>
        </div>

        {phone ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
              <span className="text-sm text-text-muted">
                {labels.phoneMasked}
              </span>
              <span className="font-semibold text-text" dir="ltr">
                {maskPhone(phone)}
              </span>
            </div>
            <a
              href={buildWhatsAppUrl(phone, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Icon name="whatsapp" size={20} />
              {labels.whatsapp}
            </a>
            <a
              href={buildTelUrl(phone)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-500 font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              <Icon name="phone" size={18} />
              {labels.call}
            </a>
          </div>
        ) : (
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-text-muted">
            {labels.phoneMasked}
          </p>
        )}
      </div>
    </Card>
  );
}

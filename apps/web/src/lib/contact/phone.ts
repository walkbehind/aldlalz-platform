const KUWAIT_COUNTRY_CODE = "965";

export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function toWhatsAppNumber(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.startsWith(KUWAIT_COUNTRY_CODE)) return digits;
  if (digits.startsWith("0")) return `${KUWAIT_COUNTRY_CODE}${digits.slice(1)}`;
  return `${KUWAIT_COUNTRY_CODE}${digits}`;
}

export function buildWhatsAppUrl(phone: string, message?: string) {
  const number = toWhatsAppNumber(phone);
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildTelUrl(phone: string) {
  const digits = digitsOnly(phone);
  return `tel:+${digits.startsWith(KUWAIT_COUNTRY_CODE) ? digits : toWhatsAppNumber(phone)}`;
}

/** Mask middle digits for safe public display */
export function maskPhone(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length < 7) return phone;
  const visibleStart = digits.slice(0, digits.length - 4);
  const visibleEnd = digits.slice(-3);
  return `+${visibleStart.slice(0, 3)} ${visibleStart.slice(3, 6)} *** ${visibleEnd}`;
}

export function displayOwnerName(
  owner: { nameAr?: string | null; nameEn?: string | null },
  locale: string
) {
  if (locale === "ar") {
    return owner.nameAr || owner.nameEn || null;
  }
  return owner.nameEn || owner.nameAr || null;
}

export function buildListingWhatsAppMessage(
  title: string,
  listingUrl: string,
  locale: string
) {
  if (locale === "ar") {
    return `مرحباً، أنا مهتم بهذا العقار: ${title}\n${listingUrl}`;
  }
  return `Hello, I'm interested in this listing: ${title}\n${listingUrl}`;
}

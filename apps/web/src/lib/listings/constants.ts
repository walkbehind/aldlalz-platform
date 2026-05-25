import type {
  AdminStatus,
  KuwaitGovernorate,
  ListingStatus,
  ListingType,
  PropertyType,
} from "@aldlalz/database";

export const LISTING_TYPES: ListingType[] = [
  "SALE",
  "RENT",
  "BOOKING",
  "PROJECT",
  "ENTERTAINMENT",
];

export const PROPERTY_TYPES: PropertyType[] = [
  "APARTMENT",
  "VILLA",
  "HOUSE",
  "DUPLEX",
  "CHALET",
  "OFFICE",
  "SHOP",
  "WAREHOUSE",
  "LAND",
  "BUILDING",
  "OTHER",
];

export const GOVERNORATES: KuwaitGovernorate[] = [
  "CAPITAL",
  "HAWALLI",
  "FARWANIYA",
  "AHMADI",
  "JAHRA",
  "MUBARAK_AL_KABEER",
];

export const GOVERNORATE_AREAS: Record<
  KuwaitGovernorate,
  { ar: string; en: string }[]
> = {
  CAPITAL: [
    { ar: "الشويخ", en: "Shuwaikh" },
    { ar: "الدسمة", en: "Dasma" },
    { ar: "الدعية", en: "Da'iya" },
    { ar: "السرة", en: "Surra" },
    { ar: "اليرموك", en: "Yarmouk" },
    { ar: "القادسية", en: "Qadsiya" },
    { ar: "النزهة", en: "Nuzha" },
    { ar: "الشامية", en: "Shamiya" },
    { ar: "الروضة", en: "Rawda" },
    { ar: "الخالدية", en: "Khaldiya" },
    { ar: "العديلية", en: "Adailiya" },
    { ar: "القبلة", en: "Qibla" },
    { ar: "شرق", en: "Sharq" },
    { ar: "المرقاب", en: "Mirqab" },
    { ar: "الصوابر", en: "Sawaber" },
  ],
  HAWALLI: [
    { ar: "السالمية", en: "Salmiya" },
    { ar: "حولي", en: "Hawally" },
    { ar: "الجابرية", en: "Jabriya" },
    { ar: "الرميثية", en: "Rumaithiya" },
    { ar: "الشعب", en: "Sha'ab" },
    { ar: "بيان", en: "Bayan" },
    { ar: "مشرف", en: "Mishref" },
    { ar: "الزهراء", en: "Zahra" },
    { ar: "السلام", en: "Salam" },
    { ar: "حطين", en: "Hitteen" },
    { ar: "الشهداء", en: "Shuhada" },
    { ar: "البدع", en: "Bidaa" },
  ],
  FARWANIYA: [
    { ar: "الفروانية", en: "Farwaniya" },
    { ar: "خيطان", en: "Khaitan" },
    { ar: "الرقعي", en: "Riggae" },
    { ar: "العمرية", en: "Omariya" },
    { ar: "الرابية", en: "Rabiya" },
    { ar: "الأندلس", en: "Andalus" },
    { ar: "العارضية", en: "Ardiya" },
    { ar: "جليب الشيوخ", en: "Jleeb Al-Shuyoukh" },
    { ar: "الضجيج", en: "Dajeej" },
    { ar: "الرحاب", en: "Rehab" },
  ],
  AHMADI: [
    { ar: "الفحيحيل", en: "Fahaheel" },
    { ar: "المنقف", en: "Mangaf" },
    { ar: "أبو حليفة", en: "Abu Halifa" },
    { ar: "الفنطاس", en: "Fintas" },
    { ar: "المهبولة", en: "Mahboula" },
    { ar: "الأحمدي", en: "Ahmadi" },
    { ar: "الصباحية", en: "Sabahiya" },
    { ar: "الوفرة", en: "Wafra" },
    { ar: "الخيران", en: "Khiran" },
    { ar: "الفنيطيس", en: "Funaitees" },
  ],
  JAHRA: [
    { ar: "الجهراء", en: "Jahra" },
    { ar: "القصر", en: "Qasr" },
    { ar: "النعيم", en: "Na'im" },
    { ar: "الواحة", en: "Waha" },
    { ar: "الصليبية", en: "Sulaibiya" },
    { ar: "العبدلي", en: "Abdali" },
    { ar: "كبد", en: "Kabd" },
    { ar: "السالمي", en: "Salmi" },
  ],
  MUBARAK_AL_KABEER: [
    { ar: "صباح السالم", en: "Sabah Al-Salem" },
    { ar: "القرين", en: "Qurain" },
    { ar: "الفنيطيس", en: "Funaitees" },
    { ar: "المسيلة", en: "Messila" },
    { ar: "أبو فطيرة", en: "Abu Fatira" },
    { ar: "العدان", en: "Adan" },
    { ar: "القصور", en: "Qusour" },
    { ar: "المسايل", en: "Mesaile" },
  ],
};

export const LISTING_TYPE_LABELS: Record<
  ListingType,
  { ar: string; en: string }
> = {
  SALE: { ar: "بيع", en: "Sale" },
  RENT: { ar: "إيجار", en: "Rent" },
  BOOKING: { ar: "حجز", en: "Booking" },
  PROJECT: { ar: "مشروع", en: "Project" },
  ENTERTAINMENT: { ar: "ترفيه", en: "Entertainment" },
};

export const PROPERTY_TYPE_LABELS: Record<
  PropertyType,
  { ar: string; en: string }
> = {
  APARTMENT: { ar: "شقة", en: "Apartment" },
  VILLA: { ar: "فيلا", en: "Villa" },
  HOUSE: { ar: "بيت", en: "House" },
  DUPLEX: { ar: "دوبلكس", en: "Duplex" },
  CHALET: { ar: "استراحة", en: "Chalet" },
  OFFICE: { ar: "مكتب", en: "Office" },
  SHOP: { ar: "محل", en: "Shop" },
  WAREHOUSE: { ar: "مخزن", en: "Warehouse" },
  LAND: { ar: "أرض", en: "Land" },
  BUILDING: { ar: "عمارة", en: "Building" },
  OTHER: { ar: "أخرى", en: "Other" },
};

export const GOVERNORATE_LABELS: Record<
  KuwaitGovernorate,
  { ar: string; en: string }
> = {
  CAPITAL: { ar: "العاصمة", en: "Capital" },
  HAWALLI: { ar: "حولي", en: "Hawalli" },
  FARWANIYA: { ar: "الفروانية", en: "Farwaniya" },
  AHMADI: { ar: "الأحمدي", en: "Ahmadi" },
  JAHRA: { ar: "الجهراء", en: "Jahra" },
  MUBARAK_AL_KABEER: { ar: "مبارك الكبير", en: "Mubarak Al-Kabeer" },
};

export const ADMIN_STATUS_LABELS: Record<
  AdminStatus,
  { ar: string; en: string }
> = {
  PENDING: { ar: "قيد المراجعة", en: "Pending" },
  APPROVED: { ar: "معتمد", en: "Approved" },
  REJECTED: { ar: "مرفوض", en: "Rejected" },
};

export const LISTING_STATUS_LABELS: Record<
  ListingStatus,
  { ar: string; en: string }
> = {
  AVAILABLE: { ar: "متاح", en: "Available" },
  SOLD: { ar: "مباع", en: "Sold" },
  RENTED: { ar: "مؤجر", en: "Rented" },
  BOOKED: { ar: "محجوز", en: "Booked" },
  NEGOTIATING: { ar: "قيد التفاوض", en: "Negotiating" },
  UNDER_REVIEW: { ar: "تحت المراجعة", en: "Under review" },
};

export const PAGE_SIZE = 12;

export function labelFor<T extends string>(
  map: Record<T, { ar: string; en: string }>,
  key: T,
  locale: string
): string {
  return locale === "ar" ? map[key].ar : map[key].en;
}

export function formatPriceKwd(price: number | string, locale: string): string {
  const value = typeof price === "string" ? Number(price) : price;
  return new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-KW", {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

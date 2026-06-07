import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { HeroSearch } from "@/components/home/hero-search";
import { ListingCard } from "@/components/listings/listing-card";
import {
  getFeaturedListings,
  searchPublicListings,
} from "@/lib/listings/queries";
import {
  GOVERNORATE_AREAS,
  LISTING_TYPE_LABELS,
  labelFor,
} from "@/lib/listings/constants";

type Props = { params: Promise<{ locale: string }> };

const CATEGORY_ICONS: Record<string, IconName> = {
  SALE: "building",
  RENT: "key",
  BOOKING: "calendar",
  PROJECT: "layers",
  ENTERTAINMENT: "sparkles",
};

const CATEGORIES = ["SALE", "RENT", "BOOKING", "ENTERTAINMENT"] as const;

const POPULAR_AREAS = [
  { ar: "السالمية", en: "Salmiya", gov: "HAWALLI" },
  { ar: "الجابرية", en: "Jabriya", gov: "HAWALLI" },
  { ar: "شرق", en: "Sharq", gov: "CAPITAL" },
  { ar: "المهبولة", en: "Mahboula", gov: "AHMADI" },
  { ar: "الفنطاس", en: "Fintas", gov: "AHMADI" },
  { ar: "صباح السالم", en: "Sabah Al-Salem", gov: "MUBARAK_AL_KABEER" },
  { ar: "الشويخ", en: "Shuwaikh", gov: "CAPITAL" },
  { ar: "المنقف", en: "Mangaf", gov: "AHMADI" },
];

const TRUST: { icon: IconName; key: string }[] = [
  { icon: "verified", key: "verified" },
  { icon: "mapPin", key: "local" },
  { icon: "whatsapp", key: "secure" },
  { icon: "layers", key: "bilingual" },
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  let total = 0;
  let featured: Awaited<ReturnType<typeof getFeaturedListings>> = [];
  try {
    const [search, featuredResult] = await Promise.all([
      searchPublicListings({}),
      getFeaturedListings(6),
    ]);
    total = search.total;
    featured = featuredResult;
  } catch {
    total = 0;
    featured = [];
  }

  const areaCount = Object.values(GOVERNORATE_AREAS).reduce(
    (sum, areas) => sum + areas.length,
    0
  );

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US");
  const stats = [
    { value: `${nf.format(Math.max(total, 0))}+`, label: t("stats.listings") },
    { value: `${nf.format(areaCount)}+`, label: t("stats.areas") },
    { value: nf.format(6), label: t("stats.governorates") },
    { value: t("statsSupportValue"), label: t("stats.support") },
  ];

  const heroTabs = CATEGORIES.map((type) => ({
    type,
    label: labelFor(LISTING_TYPE_LABELS, type, locale),
    icon: CATEGORY_ICONS[type],
  }));

  const popularSearches = POPULAR_AREAS.slice(0, 4).map((a) => ({
    label: locale === "ar" ? a.ar : a.en,
    href: `/listings?governorate=${a.gov}&area=${encodeURIComponent(a.ar)}`,
  }));

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative -mt-8 overflow-hidden bg-hero-mesh pb-16 pt-16 text-white sm:pb-20 sm:pt-20">
        <Container className="relative">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-gold-200 backdrop-blur">
              <Icon name="verified" size={16} />
              {t("heroBadge")}
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="mt-9 max-w-3xl animate-fade-up [animation-delay:120ms]">
            <HeroSearch
              searchPlaceholder={t("searchPlaceholder")}
              searchButton={t("searchButton")}
              tabs={heroTabs}
              popularLabel={t("popularSearches")}
              popular={popularSearches}
            />
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold text-gold-300 sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-brand-100">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ─── Categories ───────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <SectionHeading
          title={t("categoriesTitle")}
          subtitle={t("categoriesSubtitle")}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((type) => (
            <Link
              key={type}
              href={`/listings?listingType=${type}`}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] hover-lift"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon name={CATEGORY_ICONS[type]} size={24} />
              </span>
              <p className="mt-4 text-base font-semibold text-text">
                {labelFor(LISTING_TYPE_LABELS, type, locale)}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-500">
                {t("viewAll")}
                <Icon
                  name="arrowRight"
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>

      {/* ─── Featured listings ────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-surface py-14 sm:py-16">
          <Container>
            <SectionHeading
              title={t("featuredTitle")}
              subtitle={t("featuredSubtitle")}
              action={
                <Link href="/listings">
                  <Button variant="outline" size="sm">
                    {t("viewAll")}
                    <Icon name="arrowRight" size={16} className="rtl:rotate-180" />
                  </Button>
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  locale={locale}
                  viewDetailsLabel={t("viewAll")}
                  featuredLabel={t("featuredTitle")}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ─── Popular areas ────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <SectionHeading
          title={t("areasTitle")}
          subtitle={t("areasSubtitle")}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {POPULAR_AREAS.map((area, i) => (
            <Link
              key={area.en}
              href={`/listings?governorate=${area.gov}&area=${encodeURIComponent(area.ar)}`}
              className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-brand-gradient p-4 text-white shadow-[var(--shadow-card)] hover-lift sm:h-40"
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-60 transition-opacity group-hover:opacity-80"
                style={{
                  background:
                    i % 2 === 0
                      ? "radial-gradient(circle at 75% 20%, rgba(212,175,87,0.35), transparent 60%)"
                      : "radial-gradient(circle at 20% 25%, rgba(47,83,132,0.6), transparent 60%)",
                }}
              />
              <Icon
                name="mapPin"
                size={22}
                className="relative mb-auto text-gold-300"
              />
              <p className="relative text-base font-semibold">
                {locale === "ar" ? area.ar : area.en}
              </p>
              <p className="relative text-xs text-brand-100">
                {locale === "ar" ? area.en : area.ar}
              </p>
            </Link>
          ))}
        </div>
      </Container>

      {/* ─── Trust indicators ─────────────────────────────── */}
      <section className="bg-surface py-14 sm:py-16">
        <Container>
          <SectionHeading
            title={t("trustTitle")}
            subtitle={t("trustSubtitle")}
            centered
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div
                key={item.key}
                className="rounded-[var(--radius-card)] border border-border bg-surface-muted/60 p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-brand-700">
                  <Icon name={item.icon} size={24} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-text">
                  {t(`trust.${item.key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {t(`trust.${item.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── CTA banner ───────────────────────────────────── */}
      <Container className="py-14 sm:py-16">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-hero-mesh px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("ctaBannerTitle")}
            </h2>
            <p className="mt-3 text-brand-100">{t("ctaBannerSubtitle")}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard/listings/new">
                <Button variant="accent" size="lg">
                  <Icon name="plus" size={18} />
                  {t("ctaBannerButton")}
                </Button>
              </Link>
              <Link href="/listings">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t("ctaListings")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
  centered,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={`mb-7 gap-4 ${
        centered
          ? "text-center"
          : "flex flex-col items-start justify-between sm:flex-row sm:items-end"
      }`}
    >
      <div className={centered ? "mx-auto max-w-2xl" : ""}>
        <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-text-muted">{subtitle}</p>
        )}
      </div>
      {action && !centered && <div className="shrink-0">{action}</div>}
    </div>
  );
}

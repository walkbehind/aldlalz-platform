import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import {
  getFeaturedListings,
  searchPublicListings,
} from "@/lib/listings/queries";
import type { ListingSearchParams } from "@/lib/listings/validation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ListingSearchParams>;
};

export default async function ListingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("listings");
  const hasFilters = Object.entries(filters).some(
    ([key, value]) => key !== "page" && value
  );

  let items: Awaited<ReturnType<typeof searchPublicListings>>["items"] = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;
  let featured: Awaited<ReturnType<typeof getFeaturedListings>> = [];
  let loadError: string | null = null;

  try {
    const [searchResult, featuredResult] = await Promise.all([
      searchPublicListings(filters),
      hasFilters ? Promise.resolve([]) : getFeaturedListings(3),
    ]);
    items = searchResult.items;
    page = searchResult.page;
    totalPages = searchResult.totalPages;
    total = searchResult.total;
    featured = featuredResult;
  } catch (error) {
    console.error("[listings]", error);
    loadError =
      error instanceof Error ? error.message : "Database query failed";
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `/listings?${params.toString()}`;
  }

  return (
    <Container className="pb-12">
      {/* Page header */}
      <div className="mb-6 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          {t("title")}
        </h1>
        <p className="mt-2 text-text-muted">{t("subtitle")}</p>
      </div>

      {loadError && (
        <Card className="mb-6 border-warning/30 bg-warning-soft">
          <p className="font-semibold text-warning">{t("loadError")}</p>
          <p className="mt-2 text-sm text-text-muted">{loadError}</p>
          <p className="mt-2 text-sm text-text-muted">{t("loadErrorHint")}</p>
        </Card>
      )}

      {!loadError && !hasFilters && featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold">
            <Icon name="sparkles" size={20} className="text-gold-500" />
            {t("featuredTitle")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                viewDetailsLabel={t("viewDetails")}
                featuredLabel={t("featuredBadge")}
              />
            ))}
          </div>
        </section>
      )}

      {/* Two-column: filters + results */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
        <aside className="lg:self-start">
          <ListingFilters initial={filters} />
        </aside>

        <div className="min-w-0">
          {!loadError && (
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-text">
                {t("resultsTitle")}
              </h2>
              <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-text-muted shadow-[var(--shadow-xs)]">
                {t("resultsCount", { count: total })}
              </span>
            </div>
          )}

          {!loadError && items.length === 0 ? (
            <EmptyState title={t("empty")} />
          ) : !loadError ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    locale={locale}
                    viewDetailsLabel={t("viewDetails")}
                    featuredLabel={t("featuredBadge")}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  {prevPage ? (
                    <Link href={pageHref(prevPage)}>
                      <Button variant="secondary" size="sm">
                        <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
                        {t("prevPage")}
                      </Button>
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm font-medium text-text-muted">
                    {t("pageOf", { page, total: totalPages })}
                  </span>
                  {nextPage ? (
                    <Link href={pageHref(nextPage)}>
                      <Button variant="secondary" size="sm">
                        {t("nextPage")}
                        <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                      </Button>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

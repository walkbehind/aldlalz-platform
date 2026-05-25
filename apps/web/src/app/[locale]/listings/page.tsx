import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      hasFilters ? Promise.resolve([]) : getFeaturedListings(6),
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
    <Container>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {loadError && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <p className="font-medium text-amber-900">{t("loadError")}</p>
          <p className="mt-2 text-sm text-amber-800">{loadError}</p>
          <p className="mt-2 text-sm text-amber-800">{t("loadErrorHint")}</p>
        </Card>
      )}

      {!loadError && !hasFilters && featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">{t("featuredTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      <ListingFilters initial={filters} />

      {!loadError && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-text-muted">
          {t("empty")}
        </p>
      ) : !loadError ? (
        <>
          <p className="mb-4 text-sm text-text-muted">
            {t("resultsCount", { count: total })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-8 flex items-center justify-center gap-3">
              {prevPage && (
                <Link href={pageHref(prevPage)}>
                  <Button variant="secondary" size="sm">
                    {t("prevPage")}
                  </Button>
                </Link>
              )}
              <span className="text-sm text-text-muted">
                {t("pageOf", { page, total: totalPages })}
              </span>
              {nextPage && (
                <Link href={pageHref(nextPage)}>
                  <Button variant="secondary" size="sm">
                    {t("nextPage")}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      ) : null}
    </Container>
  );
}

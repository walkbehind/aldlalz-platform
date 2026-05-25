import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { searchPublicListings } from "@/lib/listings/queries";
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
  const { items, page, totalPages, total } = await searchPublicListings(filters);

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

      <ListingFilters initial={filters} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-text-muted">
          {t("empty")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-text-muted">
            {t("resultsCount", { count: total })}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                viewDetailsLabel={t("viewDetails")}
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
      )}
    </Container>
  );
}

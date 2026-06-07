import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { getOwnerListings } from "@/lib/listings/queries";
import { ListingStatusBadge } from "@/components/listings/listing-status-badge";
import { DeleteDraftButton } from "@/components/listings/delete-draft-button";
import { getThumbnailStorageUrl } from "@/lib/supabase/client";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
} from "@/lib/listings/constants";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function MyListingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("dashboard.listings");
  const listings = await getOwnerListings(session.user.id);

  return (
    <>
      {query.submitted && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/25 bg-success-soft px-4 py-3 text-sm font-medium text-success">
          <Icon name="checkCircle" size={20} />
          {t("submittedNotice")}
        </div>
      )}

      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Link href="/dashboard/listings/new">
            <Button variant="accent" size="sm">
              <Icon name="plus" size={16} />
              {t("create")}
            </Button>
          </Link>
        }
      />

      {listings.length === 0 ? (
        <EmptyState
          title={t("empty")}
          action={
            <Link href="/dashboard/listings/new">
              <Button variant="accent" className="w-full sm:w-auto">
                <Icon name="plus" size={16} />
                {t("createFirst")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const title =
              locale === "ar"
                ? listing.titleAr
                : listing.titleEn || listing.titleAr;
            const cover = (listing as { images?: { storagePath: string }[] })
              .images?.[0];
            const views = (listing as { viewCount?: number }).viewCount ?? 0;

            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-surface-sunken sm:h-24 sm:w-32">
                  {cover ? (
                    <Image
                      src={getThumbnailStorageUrl(cover.storagePath)}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-text-subtle">
                      <Icon name="image" size={28} />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-text">
                      {title}
                    </h2>
                    <ListingStatusBadge
                      status={listing.adminStatus}
                      locale={locale}
                      draft={listing.isDraft}
                      draftLabel={t("draft")}
                    />
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <Icon name="mapPin" size={14} className="text-brand-400" />
                    {labelFor(GOVERNORATE_LABELS, listing.governorate, locale)} ·{" "}
                    {listing.area}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="font-bold text-brand-600">
                      {formatPriceKwd(listing.priceKwd.toString(), locale)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-text-subtle">
                      <Icon name="eye" size={13} />
                      {t("views", { count: views })}
                    </span>
                  </div>
                  {listing.rejectionReason && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-danger-soft px-2.5 py-1.5 text-sm text-danger">
                      <Icon name="close" size={14} className="mt-0.5 shrink-0" />
                      {t("rejectionReason")}: {listing.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Icon name="pencil" size={15} />
                      {t("edit")}
                    </Button>
                  </Link>
                  {listing.isDraft && (
                    <DeleteDraftButton listingId={listing.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

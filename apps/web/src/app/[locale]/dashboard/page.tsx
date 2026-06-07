import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { ListingStatusBadge } from "@/components/listings/listing-status-badge";
import { getUserProfile } from "@/lib/profile/queries";
import { ContactCompletionBanner } from "@/components/profile/contact-completion-banner";
import { checkListingLimit } from "@/lib/subscriptions/queries";
import {
  formatPriceKwd,
  GOVERNORATE_LABELS,
  labelFor,
} from "@/lib/listings/constants";
import { getOwnerListings } from "@/lib/listings/queries";
import { getThumbnailStorageUrl } from "@/lib/supabase/client";
import Image from "next/image";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  const user = session.user;

  const t = await getTranslations("dashboard");
  const tProfile = await getTranslations("profile");
  const listings = await getOwnerListings(user.id);
  const profile = await getUserProfile(user.id);
  const limits = await checkListingLimit(user.id, user.role);

  const stats = {
    total: listings.length,
    approved: listings.filter(
      (l) => !l.isDraft && l.adminStatus === "APPROVED"
    ).length,
    pending: listings.filter((l) => !l.isDraft && l.adminStatus === "PENDING")
      .length,
    drafts: listings.filter((l) => l.isDraft).length,
  };

  const totalViews = listings.reduce(
    (sum, l) => sum + ((l as { viewCount?: number }).viewCount ?? 0),
    0
  );
  const featuredCount = listings.filter(
    (l) => (l as { isFeatured?: boolean }).isFeatured
  ).length;
  const avgViews = stats.total > 0 ? Math.round(totalViews / stats.total) : 0;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US");

  const ownerName =
    (locale === "ar"
      ? (user as { nameAr?: string | null }).nameAr
      : (user as { nameEn?: string | null }).nameEn) ?? user.email;

  const statCards: {
    label: string;
    value: number;
    icon: IconName;
    tone: string;
  }[] = [
    {
      label: t("stats.total"),
      value: stats.total,
      icon: "building",
      tone: "bg-brand-50 text-brand-600",
    },
    {
      label: t("stats.approved"),
      value: stats.approved,
      icon: "checkCircle",
      tone: "bg-success-soft text-success",
    },
    {
      label: t("stats.pending"),
      value: stats.pending,
      icon: "clock",
      tone: "bg-warning-soft text-warning",
    },
    {
      label: t("stats.drafts"),
      value: stats.drafts,
      icon: "layers",
      tone: "bg-surface-sunken text-text-muted",
    },
  ];

  const perf: { label: string; value: string; icon: IconName }[] = [
    { label: t("performance.views"), value: nf.format(totalViews), icon: "eye" },
    {
      label: t("performance.avgViews"),
      value: nf.format(avgViews),
      icon: "trendingUp",
    },
    {
      label: t("performance.featured"),
      value: nf.format(featuredCount),
      icon: "sparkles",
    },
  ];

  const recent = listings.slice(0, 5);

  const quickActions: {
    href: string;
    title: string;
    desc: string;
    icon: IconName;
    accent?: boolean;
  }[] = [
    {
      href: "/dashboard/listings/new",
      title: t("quickActions.newListing"),
      desc: t("quickActions.newListingDesc"),
      icon: "plus",
      accent: true,
    },
    {
      href: "/dashboard/listings",
      title: t("quickActions.manage"),
      desc: t("quickActions.manageDesc"),
      icon: "building",
    },
    {
      href: "/listings",
      title: t("quickActions.browse"),
      desc: t("quickActions.browseDesc"),
      icon: "search",
    },
  ];

  return (
    <div className="space-y-8">
      {!profile?.phone && (
        <ContactCompletionBanner
          title={tProfile("contactBanner.title")}
          description={tProfile("contactBanner.description")}
          actionLabel={tProfile("contactBanner.action")}
          href="/dashboard/profile"
        />
      )}

      {!limits.hasSubscription && limits.remaining === 0 && (
        <ContactCompletionBanner
          title={tProfile("limitBanner.title")}
          description={tProfile("limitBanner.description", {
            limit: limits.limit,
          })}
          actionLabel={tProfile("limitBanner.action")}
          href="/packages"
        />
      )}

      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-hero-mesh px-6 py-7 text-white sm:px-8">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-brand-100">{t("welcome")} 👋</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {ownerName}
            </h1>
          </div>
          <Link href="/dashboard/listings/new">
            <Button variant="accent" size="lg">
              <Icon name="plus" size={18} />
              {t("listingsCard.create")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.tone}`}
            >
              <Icon name={s.icon} size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-text">
                {nf.format(s.value)}
              </p>
              <p className="truncate text-xs font-medium uppercase tracking-wide text-text-muted">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance + recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent listings */}
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">
                {t("activity.title")}
              </h2>
              <p className="text-sm text-text-muted">{t("activity.subtitle")}</p>
            </div>
            <Link
              href="/dashboard/listings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:underline"
            >
              {t("activity.viewAll")}
              <Icon name="arrowRight" size={14} className="rtl:rotate-180" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-text-muted">
              {t("activity.empty")}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((listing) => {
                const title =
                  locale === "ar"
                    ? listing.titleAr
                    : listing.titleEn || listing.titleAr;
                const cover = (
                  listing as { images?: { storagePath: string }[] }
                ).images?.[0];
                const views =
                  (listing as { viewCount?: number }).viewCount ?? 0;
                return (
                  <li key={listing.id}>
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="group flex items-center gap-3 py-3 transition-colors"
                    >
                      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                        {cover ? (
                          <Image
                            src={getThumbnailStorageUrl(cover.storagePath)}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-text-subtle">
                            <Icon name="image" size={20} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-semibold text-text group-hover:text-brand-600">
                          {title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                          {labelFor(
                            GOVERNORATE_LABELS,
                            listing.governorate,
                            locale
                          )}{" "}
                          · {formatPriceKwd(listing.priceKwd.toString(), locale)}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-text-subtle">
                          <Icon name="eye" size={13} />
                          {t("activity.views", { count: views })}
                        </p>
                      </div>
                      <ListingStatusBadge
                        status={listing.adminStatus}
                        locale={locale}
                        draft={listing.isDraft}
                        draftLabel={t("listings.draft")}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Performance */}
        <Card>
          <h2 className="text-lg font-bold text-text">
            {t("performance.title")}
          </h2>
          <p className="text-sm text-text-muted">{t("performance.subtitle")}</p>
          <div className="mt-5 space-y-3">
            {perf.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3"
              >
                <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-brand-500 shadow-[var(--shadow-xs)]">
                    <Icon name={p.icon} size={16} />
                  </span>
                  {p.label}
                </span>
                <span className="text-lg font-bold text-text">{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-text">
          {t("quickActions.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`group rounded-[var(--radius-card)] border p-5 transition-all hover-lift ${
                a.accent
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-surface shadow-[var(--shadow-card)]"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  a.accent
                    ? "bg-white/15 text-gold-300"
                    : "bg-brand-50 text-brand-600"
                }`}
              >
                <Icon name={a.icon} size={22} />
              </span>
              <p
                className={`mt-4 font-semibold ${
                  a.accent ? "text-white" : "text-text"
                }`}
              >
                {a.title}
              </p>
              <p
                className={`mt-1 text-sm ${
                  a.accent ? "text-brand-100" : "text-text-muted"
                }`}
              >
                {a.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

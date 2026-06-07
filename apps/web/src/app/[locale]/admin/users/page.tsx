import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { AdminGrantSubscriptionForm } from "@/components/admin/admin-grant-subscription-form";
import { listAdminUsers } from "@/lib/admin/actions";
import {
  getActiveSubscription,
  listActivePackages,
} from "@/lib/subscriptions/queries";
import { formatKuwaitPhoneDisplay } from "@/lib/contact/phone";
import type { UserRole } from "@aldlalz/database";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminUsersPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin.users");
  const users = await listAdminUsers(q);
  const packages = await listActivePackages();
  const isSuperAdmin = session.user.role === "SUPERADMIN";

  const subscriptions = await Promise.all(
    users.map((u) => getActiveSubscription(u.id))
  );

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <form method="get" className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm">
          {t("search")}
        </Button>
      </form>

      {users.length === 0 ? (
        <Card>{t("empty")}</Card>
      ) : (
        <div className="space-y-4">
          {users.map((user, index) => {
            const name =
              locale === "ar"
                ? user.nameAr ?? user.nameEn ?? user.email
                : user.nameEn ?? user.nameAr ?? user.email;
            const sub = subscriptions[index];
            return (
              <Card key={user.id} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{name}</p>
                    <p className="text-sm text-text-muted" dir="ltr">
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-sm text-text-muted" dir="ltr">
                        {formatKuwaitPhoneDisplay(user.phone)}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-subtle">
                      {t("listingsCount", { count: user._count.listings })}
                      {!user.isActive && ` · ${t("inactive")}`}
                      {!user.emailVerified && ` · ${t("unverified")}`}
                    </p>
                  </div>
                  <AdminUserActions
                    userId={user.id}
                    currentRole={user.role as UserRole}
                    isActive={user.isActive}
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t("subscriptionSection")}
                  </p>
                  {sub && (
                    <p className="mb-2 text-sm text-text-muted">
                      {locale === "ar" ? sub.packageNameAr : sub.packageNameEn ?? sub.packageNameAr}
                      {" · "}
                      {t("expires", {
                        date: sub.expiresAt.toLocaleDateString(
                          locale === "ar" ? "ar-KW" : "en-KW"
                        ),
                      })}
                    </p>
                  )}
                  <AdminGrantSubscriptionForm
                    userId={user.id}
                    packages={packages}
                    activeSubscriptionId={sub?.id}
                    locale={locale}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Link
        href="/admin/subscriptions"
        className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:underline"
      >
        {t("viewAllSubscriptions")}
      </Link>
    </>
  );
}

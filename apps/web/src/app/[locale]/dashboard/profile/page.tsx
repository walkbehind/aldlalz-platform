import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { getUserProfile } from "@/lib/profile/queries";
import {
  getActiveSubscription,
  checkListingLimit,
} from "@/lib/subscriptions/queries";
import { Card } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const profile = await getUserProfile(session.user.id);
  if (!profile) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("profile");
  const [subscription, limits] = await Promise.all([
    getActiveSubscription(session.user.id),
    checkListingLimit(session.user.id, session.user.role),
  ]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-6">
        {(subscription || limits.hasSubscription === false) && (
          <Card className="max-w-lg">
            <h2 className="font-semibold text-text">{t("subscription.title")}</h2>
            {subscription ? (
              <p className="mt-1 text-sm text-text-muted">
                {locale === "ar" ? subscription.planNameAr : subscription.planNameEn ?? subscription.planNameAr}
                {" · "}
                {t("subscription.listingsLimit", { count: subscription.maxListings })}
                {" · "}
                {t("subscription.expires", {
                  date: subscription.expiresAt.toLocaleDateString(
                    locale === "ar" ? "ar-KW" : "en-KW"
                  ),
                })}
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-muted">
                {t("subscription.freeTier", { count: limits.limit, used: limits.used })}
              </p>
            )}
          </Card>
        )}

        <ProfileForm
          profile={profile}
          labels={{
            title: t("form.title"),
            subtitle: t("form.subtitle"),
            email: t("form.email"),
            emailVerified: t("form.emailVerified"),
            emailNotVerified: t("form.emailNotVerified"),
            resendVerification: t("form.resendVerification"),
            resendSent: t("form.resendSent"),
            nameAr: t("form.nameAr"),
            nameEn: t("form.nameEn"),
            phone: t("form.phone"),
            phoneHint: t("form.phoneHint"),
            langPreference: t("form.langPreference"),
            langAr: t("form.langAr"),
            langEn: t("form.langEn"),
            save: t("form.save"),
            saving: t("form.saving"),
            saved: t("form.saved"),
          }}
        />
      </div>
    </>
  );
}

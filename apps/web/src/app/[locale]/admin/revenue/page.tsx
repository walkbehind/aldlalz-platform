import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminRevenuePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) return redirect({ href: "/login", locale });
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin.revenue");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <p className="text-sm text-text-muted">{t("placeholder")}</p>
        <ul className="mt-4 list-inside list-disc text-sm text-text-muted">
          <li>{t("futureSubscriptions")}</li>
          <li>{t("futureFeatured")}</li>
          <li>{t("futureKnet")}</li>
        </ul>
      </Card>
    </>
  );
}

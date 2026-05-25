import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminListingCounts } from "@/lib/listings/queries";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  const user = session.user;
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin");
  const counts = await getAdminListingCounts();

  return (
    <Container>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">{t("listingsCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">
            {t("listingsCard.description")}
          </p>
          <p className="mt-3 text-sm">
            {t("listingsCard.pending")}:{" "}
            <span className="font-semibold">{counts.pending}</span>
          </p>
          <Link href="/admin/listings" className="mt-4 inline-block">
            <Button size="sm">{t("listingsCard.review")}</Button>
          </Link>
        </Card>
      </div>
    </Container>
  );
}

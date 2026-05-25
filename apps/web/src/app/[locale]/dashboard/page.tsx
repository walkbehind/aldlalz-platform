import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <Container>
      <PageHeader
        title={t("title")}
        subtitle={`${t("welcome")}, ${user.email}`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">{t("listingsCard.title")}</h2>
          <p className="mt-2 text-sm text-text-muted">
            {t("listingsCard.description")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/listings">
              <Button variant="outline" size="sm">
                {t("listingsCard.myListings")}
              </Button>
            </Link>
            <Link href="/dashboard/listings/new">
              <Button size="sm">{t("listingsCard.create")}</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-text-muted">{t("comingSoon")}</p>
          <p className="mt-2 text-sm">
            Role: <span className="font-mono">{user.role}</span>
          </p>
        </Card>
      </div>
    </Container>
  );
}

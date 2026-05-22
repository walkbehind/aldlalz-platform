import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }
  const user = session.user;
  const role = user.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("admin");
  const common = await getTranslations("common");

  return (
    <Container>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        badge={common("phase1")}
      />
      <Card>
        <p className="text-text-muted">{t("placeholder")}</p>
      </Card>
    </Container>
  );
}

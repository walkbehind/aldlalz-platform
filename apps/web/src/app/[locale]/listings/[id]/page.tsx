import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("listingDetail");
  const common = await getTranslations("common");

  return (
    <Container>
      <PageHeader title={t("title")} badge={common("phase1")} />
      <Card>
        <p className="text-text-muted">{t("placeholder")}</p>
        <p className="mt-2 font-mono text-sm">ID: {id}</p>
        <Link href="/listings" className="mt-6 inline-block">
          <Button variant="secondary">{common("backHome")}</Button>
        </Link>
      </Card>
    </Container>
  );
}

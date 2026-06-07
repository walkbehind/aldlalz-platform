import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.terms");

  return (
    <Container className="max-w-3xl">
      <PageHeader title={t("title")} subtitle={t("updated")} />
      <article className="prose prose-sm max-w-none space-y-4 text-text-muted">
        {(["s1", "s2", "s3", "s4", "s5"] as const).map((key) => (
          <section key={key}>
            <h2 className="text-lg font-semibold text-text">{t(`${key}Title`)}</h2>
            <p className="mt-2 leading-relaxed">{t(`${key}Body`)}</p>
          </section>
        ))}
      </article>
    </Container>
  );
}

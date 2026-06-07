import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

type Props = { params: Promise<{ locale: string }> };

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <Container>
      <PageHeader title={t("forgotPasswordTitle")} subtitle={t("forgotPasswordSubtitle")} />
      <ForgotPasswordForm />
    </Container>
  );
}

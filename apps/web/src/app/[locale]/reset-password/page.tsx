import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Alert } from "@/components/ui/feedback";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  if (!token || !email) {
    return (
      <Container>
        <PageHeader title={t("resetPasswordTitle")} />
        <Alert>{t("resetLinkInvalid")}</Alert>
        <Link href="/forgot-password" className="mt-4 inline-block text-brand-600 hover:underline">
          {t("forgotPasswordTitle")}
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title={t("resetPasswordTitle")} subtitle={t("resetPasswordSubtitle")} />
      <ResetPasswordForm token={token} email={email} />
    </Container>
  );
}

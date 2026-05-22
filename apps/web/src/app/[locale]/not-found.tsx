import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <Link href="/" className="mt-6 inline-block">
        <Button>{t("backHome")}</Button>
      </Link>
    </Container>
  );
}

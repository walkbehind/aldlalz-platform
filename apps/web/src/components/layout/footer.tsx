import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export async function Footer() {
  const t = await getTranslations("common");

  return (
    <footer className="mt-auto border-t border-border bg-surface py-8">
      <Container className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Aldlalz / الدلالز
        </p>
        <Badge>{t("phase1")}</Badge>
      </Container>
    </footer>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const common = await getTranslations("common");

  const sections = [
    { icon: "💰", titleAr: "للبيع", titleEn: "For sale" },
    { icon: "🏠", titleAr: "للإيجار", titleEn: "For rent" },
    { icon: "📅", titleAr: "حجز", titleEn: "Booking" },
    { icon: "🎉", titleAr: "ترفيه", titleEn: "Entertainment" },
  ];

  return (
    <Container>
      <section className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-8 py-16 text-white">
        <Badge className="mb-4 bg-white/20 text-white">{common("phase1")}</Badge>
        <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-xl text-lg text-brand-50">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/listings">
            <Button className="bg-white text-brand-700 hover:bg-brand-50">
              {t("ctaListings")}
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {t("ctaRegister")}
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <Card key={s.titleEn}>
            <CardTitle>
              <span className="me-2">{s.icon}</span>
              {locale === "ar" ? s.titleAr : s.titleEn}
            </CardTitle>
            <CardDescription>
              {locale === "ar" ? s.titleEn : s.titleAr}
            </CardDescription>
          </Card>
        ))}
      </section>
    </Container>
  );
}

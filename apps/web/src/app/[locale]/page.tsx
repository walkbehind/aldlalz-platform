import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  const sections = [
    { icon: "🏢", type: "SALE", titleAr: "للبيع", titleEn: "For sale" },
    { icon: "🔑", type: "RENT", titleAr: "للإيجار", titleEn: "For rent" },
    { icon: "📅", type: "BOOKING", titleAr: "حجز", titleEn: "Booking" },
    { icon: "🎉", type: "ENTERTAINMENT", titleAr: "ترفيه", titleEn: "Entertainment" },
  ];

  return (
    <Container>
      <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-bl from-brand-600 to-brand-800 px-8 py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, #d4af57 0, transparent 42%), radial-gradient(circle at 90% 80%, #0a2d5e 0, transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-xl text-lg text-brand-100">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/listings">
              <Button variant="accent">{t("ctaListings")}</Button>
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
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <Link key={s.type} href={`/listings?listingType=${s.type}`}>
            <Card className="h-full transition-shadow hover:shadow-[var(--shadow-card-hover)]">
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-2xl">
                {s.icon}
              </span>
              <CardTitle className="text-lg">
                {locale === "ar" ? s.titleAr : s.titleEn}
              </CardTitle>
              <CardDescription>
                {locale === "ar" ? s.titleEn : s.titleAr}
              </CardDescription>
            </Card>
          </Link>
        ))}
      </section>
    </Container>
  );
}

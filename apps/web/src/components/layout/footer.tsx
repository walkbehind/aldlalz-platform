import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";

const navLinks = [
  { href: "/", key: "home" as const },
  { href: "/listings", key: "listings" as const },
  { href: "/packages", key: "packages" as const },
];

export async function Footer() {
  const locale = await getLocale();
  const nav = await getTranslations("nav");
  const f = await getTranslations("footer");

  return (
    <footer className="mt-auto bg-brand-600 text-brand-100">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <BrandLogo locale={locale} tone="light" />
          <p className="mt-4 max-w-sm text-sm text-brand-100/80">
            {f("tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">
            {f("quickLinks")}
          </h3>
          <ul className="space-y-2 text-sm">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-brand-100/80 transition-colors hover:text-gold-400"
                >
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">
            {f("contact")}
          </h3>
          <ul className="space-y-2 text-sm text-brand-100/80">
            <li dir="ltr">+965 0000 0000</li>
            <li dir="ltr">info@aldlalz.com</li>
            <li>{locale === "ar" ? "الكويت" : "Kuwait"}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-100/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Aldlalz / الدلالز — {f("rights")}
          </p>
          <p dir="ltr">Kuwait Property Marketplace</p>
        </Container>
      </div>
    </footer>
  );
}

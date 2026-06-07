import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
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
    <footer className="mt-auto bg-brand-gradient text-brand-100">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="inline-flex rounded-2xl bg-white/95 px-4 py-3 shadow-float">
            <BrandLogo locale={locale} />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/80">
            {f("tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
            {f("quickLinks")}
          </h3>
          <ul className="space-y-3 text-sm">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-brand-100/80 transition-colors hover:text-gold-400"
                >
                  <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
            {f("contact")}
          </h3>
          <ul className="space-y-3 text-sm text-brand-100/80">
            <li className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                <Icon name="phone" size={16} />
              </span>
              <span dir="ltr">+965 0000 0000</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                <Icon name="share" size={16} />
              </span>
              <span dir="ltr">info@aldlalz.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                <Icon name="mapPin" size={16} />
              </span>
              <span>{locale === "ar" ? "الكويت" : "Kuwait"}</span>
            </li>
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

"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const navItems = [
  { href: "/", key: "home" as const },
  { href: "/listings", key: "listings" as const },
  { href: "/packages", key: "packages" as const },
];

type HeaderProps = {
  session?: {
    user?: {
      email?: string | null;
      role?: string;
    } | null;
  } | null;
};

export function Header({ session }: HeaderProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="-ms-2 rounded-lg p-2 text-text hover:bg-surface-muted md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <Link href="/" aria-label="Aldlalz">
            <BrandLogo locale={locale} />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("primaryNav")}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted ${
                  active ? "text-brand-600" : "text-text-muted"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/listings/new" className="hidden sm:block">
            <Button variant="accent" size="sm">
              {t("addListing")}
            </Button>
          </Link>
          <LocaleSwitcher />

          {session?.user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  {t("dashboard")}
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    {t("admin")}
                  </Button>
                </Link>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
              >
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </div>
          )}
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm font-medium ${
                    active ? "bg-brand-50 text-brand-700" : "text-text"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-border" />

            <Link
              href="/dashboard/listings/new"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-gold-500 px-3 py-3 text-center text-sm font-semibold text-brand-700"
            >
              {t("addListing")}
            </Link>

            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-text"
                >
                  {t("dashboard")}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-text"
                  >
                    {t("admin")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: `/${locale}` });
                  }}
                  className="rounded-lg px-3 py-3 text-start text-sm font-medium text-text"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-text"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-500 px-3 py-3 text-center text-sm font-semibold text-white"
                >
                  {t("register")}
                </Link>
              </>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}

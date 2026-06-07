"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type IconKey = "overview" | "listings" | "add" | "moderation" | "back";

function Icon({ name }: { name: IconKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "listings":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "add":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "moderation":
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );
  }
}

type NavItem = { href: string; label: string; icon: IconKey };

type Props = {
  section: "dashboard" | "admin";
};

export function AppSidebar({ section }: Props) {
  const t = useTranslations(section === "admin" ? "adminNav" : "dashboardNav");
  const pathname = usePathname();

  const items: NavItem[] = useMemo(() => {
    if (section === "admin") {
      return [
        { href: "/admin", label: t("overview"), icon: "overview" },
        { href: "/admin/listings", label: t("moderation"), icon: "moderation" },
      ];
    }
    return [
      { href: "/dashboard", label: t("overview"), icon: "overview" },
      { href: "/dashboard/listings", label: t("myListings"), icon: "listings" },
      { href: "/dashboard/listings/new", label: t("addListing"), icon: "add" },
    ];
  }, [section, t]);

  const activeHref = useMemo(() => {
    let best = "";
    for (const it of items) {
      if (pathname === it.href || pathname.startsWith(`${it.href}/`)) {
        if (it.href.length > best.length) best = it.href;
      }
    }
    return best;
  }, [items, pathname]);

  const dark = section === "admin";

  const shell = dark
    ? "bg-brand-600 text-brand-100"
    : "bg-surface text-text border border-border";

  return (
    <aside
      className={`rounded-[var(--radius-card)] p-3 lg:sticky lg:top-24 lg:h-fit ${shell}`}
      aria-label={t("section")}
    >
      <p
        className={`px-2 pb-2 text-xs font-semibold uppercase tracking-wide ${
          dark ? "text-brand-100/60" : "text-text-muted"
        }`}
      >
        {t("section")}
      </p>
      <nav
        className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        aria-label={t("section")}
      >
        {items.map((item) => {
          const active = item.href === activeHref;
          const base =
            "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:shrink";
          const state = dark
            ? active
              ? "bg-gold-500 text-brand-700"
              : "text-brand-100/80 hover:bg-white/10 hover:text-white"
            : active
              ? "bg-brand-50 text-brand-700"
              : "text-text-muted hover:bg-surface-muted hover:text-text";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${base} ${state}`}
            >
              <Icon name={item.icon} />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

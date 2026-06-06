import { routing } from "@/i18n/routing";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function localePath(locale: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function absoluteUrl(locale: string, path: string) {
  return `${getSiteUrl()}${localePath(locale, path)}`;
}

export const SITEMAP_LOCALES = routing.locales;

import type { MetadataRoute } from "next";
import { getSitemapListings } from "@/lib/listings/queries";
import { absoluteUrl, getSiteUrl, SITEMAP_LOCALES } from "@/lib/seo/site";

const STATIC_PATHS = ["", "/listings", "/packages", "/login", "/register", "/terms", "/privacy", "/forgot-password"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SITEMAP_LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(locale, path || "/"),
        lastModified: now,
        changeFrequency: path === "/listings" ? "hourly" : "weekly",
        priority: path === "" ? 1 : path === "/listings" ? 0.9 : 0.5,
      });
    }
  }

  try {
    const listings = await getSitemapListings();
    for (const listing of listings) {
      for (const locale of SITEMAP_LOCALES) {
        entries.push({
          url: absoluteUrl(locale, `/listings/${listing.id}`),
          lastModified: listing.updatedAt,
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap]", error);
  }

  // Ensure at least homepage is present if DB is down
  if (entries.length === 0) {
    entries.push({ url: base, lastModified: now });
  }

  return entries;
}

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ar/dashboard/", "/en/dashboard/", "/ar/admin/", "/en/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../..");

const prismaTraceGlobs = [
  "./node_modules/.prisma/client/**",
  "./node_modules/@prisma/client/**",
];

const nextConfig: NextConfig = {
  transpilePackages: ["@aldlalz/database"],
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/*": prismaTraceGlobs,
    "/api/**/*": prismaTraceGlobs,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/maps/api/staticmap/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

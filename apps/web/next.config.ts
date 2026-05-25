import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@aldlalz/database"],
  // Include Prisma query engine from the monorepo package in Vercel serverless bundles
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/*": ["./packages/database/src/generated/prisma/**"],
    "/api/**/*": ["./packages/database/src/generated/prisma/**"],
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
        hostname: "maps.googleapis.com",
        pathname: "/maps/api/staticmap/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

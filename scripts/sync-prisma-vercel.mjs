/**
 * Copy Prisma query engine binaries into the Next.js server bundle (Vercel).
 * Run after `next build` from the monorepo root.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const engineSourceDirs = [
  path.join(root, "node_modules", ".prisma", "client"),
  path.join(root, "packages", "database", "node_modules", ".prisma", "client"),
];

const destDirs = [
  path.join(root, "apps", "web", ".next", "server"),
  path.join(root, "apps", "web", ".next", "server", "app"),
  path.join(root, "apps", "web", ".next", "server", "chunks"),
];

function copyEnginesFrom(srcDir) {
  if (!fs.existsSync(srcDir)) return 0;
  let copied = 0;

  for (const file of fs.readdirSync(srcDir)) {
    const isEngine =
      file.startsWith("libquery_engine") ||
      file.startsWith("query_engine") ||
      file === "schema.prisma";

    if (!isEngine) continue;

    for (const destDir of destDirs) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
    copied++;
  }

  return copied;
}

let total = 0;
for (const src of engineSourceDirs) {
  total += copyEnginesFrom(src);
}

if (total === 0) {
  console.warn("[sync-prisma-vercel] No Prisma engine files found to copy.");
  process.exit(0);
}

console.log(`[sync-prisma-vercel] Copied ${total} Prisma artifact(s) into .next/server`);

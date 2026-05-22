import { PrismaClient } from "../packages/database/src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const [info] = await prisma.$queryRaw<
    [{ db: string; version: string }]
  >`SELECT current_database() AS db, version() AS version`;

  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log("Connection OK");
  console.log("Database:", info.db);
  console.log("PostgreSQL:", info.version.split(" ")[0]);
  console.log(
    "Tables:",
    tables.length ? tables.map((t) => t.table_name).join(", ") : "(none — run db:migrate:deploy)"
  );
}

main()
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

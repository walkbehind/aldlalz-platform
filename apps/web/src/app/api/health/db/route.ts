import { prisma } from "@aldlalz/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [ping] = await prisma.$queryRaw<
      [{ db: string; now: Date }]
    >`SELECT current_database() AS db, NOW() AS now`;

    const tables = await prisma.$queryRaw<
      { table_name: string }[]
    >`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const migrations = await prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null }[]
    >`
      SELECT migration_name, finished_at
      FROM "_prisma_migrations"
      ORDER BY finished_at
    `;

    const tableNames = tables.map((t) => t.table_name);
    const phase3Ready =
      tableNames.includes("listing_images") &&
      migrations.some((m) => m.migration_name === "003_listing_media_location");

    return NextResponse.json({
      ok: true,
      database: ping.db,
      serverTime: ping.now,
      tables: tableNames,
      migrations: migrations.map((m) => m.migration_name),
      phase3Ready,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

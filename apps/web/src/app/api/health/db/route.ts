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

    return NextResponse.json({
      ok: true,
      database: ping.db,
      serverTime: ping.now,
      tables: tables.map((t) => t.table_name),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

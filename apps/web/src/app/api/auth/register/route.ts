import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@aldlalz/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const locale = body.locale === "en" ? "en" : "ar";

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        nameAr: locale === "ar" ? name : null,
        nameEn: locale === "en" ? name : null,
        langPreference: locale,
        role: "USER",
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

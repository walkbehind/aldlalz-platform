import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@aldlalz/database";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeKuwaitPhone, isValidKuwaitPhone } from "@/lib/contact/phone";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().optional(),
  locale: z.enum(["ar", "en"]).optional().default("ar"),
});

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`register:${getClientIp(request)}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const { email, password, name, phone: rawPhone, locale } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }

    let phone: string | null = null;
    if (rawPhone && rawPhone.length > 0) {
      if (!isValidKuwaitPhone(rawPhone)) {
        return NextResponse.json({ error: "PHONE_INVALID" }, { status: 400 });
      }
      phone = normalizeKuwaitPhone(rawPhone);
      const phoneTaken = await prisma.user.findFirst({ where: { phone } });
      if (phoneTaken) {
        return NextResponse.json({ error: "PHONE_TAKEN" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone,
        nameAr: locale === "ar" ? name : null,
        nameEn: locale === "en" ? name : null,
        langPreference: locale,
        role: "USER",
      },
    });

    const token = await createAuthToken("email-verify", email);
    await sendVerificationEmail(email, token, locale);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

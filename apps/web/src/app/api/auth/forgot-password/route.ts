import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@aldlalz/database";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: z.enum(["ar", "en"]).optional().default("ar"),
});

export async function POST(request: Request) {
  const limit = rateLimit(`forgot:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { email, locale } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return ok to avoid email enumeration
  if (user?.passwordHash && user.isActive) {
    const token = await createAuthToken("password-reset", email);
    await sendPasswordResetEmail(email, token, locale);
  }

  return NextResponse.json({ ok: true });
}

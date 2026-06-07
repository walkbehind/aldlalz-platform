import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@aldlalz/database";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { consumeAuthToken } from "@/lib/auth/tokens";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().min(1),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const limit = rateLimit(`reset:${getClientIp(request)}`, 10, 60 * 60 * 1000);
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

  const { email, token, password } = parsed.data;

  const valid = await consumeAuthToken("password-reset", email, token);
  if (!valid) {
    return NextResponse.json({ error: "TOKEN_INVALID" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.isActive) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}

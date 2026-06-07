import { NextResponse } from "next/server";
import { prisma } from "@aldlalz/database";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";
import { requireSessionUser } from "@/lib/listings/auth";

export async function POST(request: Request) {
  let sessionUser;
  try {
    sessionUser = await requireSessionUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const limit = rateLimit(
    `resend-verify:${getClientIp(request)}`,
    3,
    60 * 60 * 1000
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, emailVerified: true, langPreference: true },
  });

  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const locale = user.langPreference === "en" ? "en" : "ar";
  const token = await createAuthToken("email-verify", user.email);
  await sendVerificationEmail(user.email, token, locale);

  return NextResponse.json({ ok: true });
}

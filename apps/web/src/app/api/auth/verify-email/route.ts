import { NextResponse } from "next/server";
import { prisma } from "@aldlalz/database";
import { consumeAuthToken } from "@/lib/auth/tokens";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email")?.toLowerCase().trim();
  const locale = url.searchParams.get("locale") === "en" ? "en" : "ar";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectBase = `${appUrl}/${locale}/login`;

  if (!token || !email) {
    return NextResponse.redirect(`${redirectBase}?verified=invalid`);
  }

  const valid = await consumeAuthToken("email-verify", email, token);
  if (!valid) {
    return NextResponse.redirect(`${redirectBase}?verified=invalid`);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(`${redirectBase}?verified=1`);
}

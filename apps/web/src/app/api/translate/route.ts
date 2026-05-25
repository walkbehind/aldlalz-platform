import { auth } from "@/lib/auth";
import {
  isTranslationConfigured,
  translateListingContent,
  type LocaleCode,
} from "@/lib/translation";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  from: z.enum(["ar", "en"]),
  to: z.enum(["ar", "en"]),
});

function errorResponse(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  if (!isTranslationConfigured()) {
    return errorResponse("NOT_CONFIGURED", 503);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("VALIDATION", 400);
  }

  const { title, description, from, to } = parsed.data;
  if (from === to) {
    return errorResponse("SAME_LOCALE", 400);
  }

  try {
    const result = await translateListingContent({
      title,
      description,
      from: from as LocaleCode,
      to: to as LocaleCode,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "TRANSLATION_FAILED";
    const status =
      message === "NOT_CONFIGURED"
        ? 503
        : message === "TITLE_REQUIRED" || message === "SAME_LOCALE"
          ? 400
          : 502;
    return errorResponse(message, status);
  }
}

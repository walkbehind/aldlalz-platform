import type { LocaleCode, TranslateListingInput } from "./types";

const LANG: Record<LocaleCode, string> = {
  ar: "Arabic",
  en: "English",
};

export function buildTranslationPrompt(input: TranslateListingInput) {
  const desc = input.description?.trim() ?? "";
  return `You translate Kuwait real estate listing content for Aldlalz (الدلالز).
Translate from ${LANG[input.from]} to ${LANG[input.to]}.
Keep property terms, area names, and KWD prices accurate. Use natural ${LANG[input.to]} for local buyers.
Return ONLY valid JSON with keys "title" and "description" (no markdown, no extra keys).
Title max 200 characters. Description max 5000 characters.

Source title: ${JSON.stringify(input.title.trim())}
Source description: ${JSON.stringify(desc)}`;
}

export function parseTranslationResponse(text: string) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("INVALID_RESPONSE");

  const parsed = JSON.parse(jsonMatch[0]) as {
    title?: unknown;
    description?: unknown;
  };

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const description =
    typeof parsed.description === "string" ? parsed.description.trim() : "";

  if (!title) throw new Error("INVALID_RESPONSE");
  return { title, description };
}

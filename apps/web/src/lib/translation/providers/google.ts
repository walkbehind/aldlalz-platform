import { GOOGLE_MODEL, getGoogleAiKey } from "../config";
import { buildTranslationPrompt, parseTranslationResponse } from "../prompt";
import type { TranslateListingInput, TranslateListingResult } from "../types";

export async function translateWithGoogle(
  input: TranslateListingInput
): Promise<TranslateListingResult> {
  const key = getGoogleAiKey();
  if (!key) throw new Error("PROVIDER_UNAVAILABLE");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      contents: [{ parts: [{ text: buildTranslationPrompt(input) }] }],
    }),
  });

  if (!res.ok) throw new Error("PROVIDER_ERROR");

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("INVALID_RESPONSE");

  const parsed = parseTranslationResponse(content);
  return { ...parsed, provider: "google" };
}

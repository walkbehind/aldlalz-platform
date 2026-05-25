import { OPENAI_MODEL, getOpenAiKey } from "../config";
import { buildTranslationPrompt, parseTranslationResponse } from "../prompt";
import type { TranslateListingInput, TranslateListingResult } from "../types";

export async function translateWithOpenAi(
  input: TranslateListingInput
): Promise<TranslateListingResult> {
  const key = getOpenAiKey();
  if (!key) throw new Error("PROVIDER_UNAVAILABLE");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a professional Kuwait real estate translator. Output JSON only.",
        },
        { role: "user", content: buildTranslationPrompt(input) },
      ],
    }),
  });

  if (!res.ok) throw new Error("PROVIDER_ERROR");

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("INVALID_RESPONSE");

  const parsed = parseTranslationResponse(content);
  return { ...parsed, provider: "openai" };
}

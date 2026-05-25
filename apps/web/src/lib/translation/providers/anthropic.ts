import { ANTHROPIC_MODEL, getAnthropicKey } from "../config";
import { buildTranslationPrompt, parseTranslationResponse } from "../prompt";
import type { TranslateListingInput, TranslateListingResult } from "../types";

export async function translateWithAnthropic(
  input: TranslateListingInput
): Promise<TranslateListingResult> {
  const key = getAnthropicKey();
  if (!key) throw new Error("PROVIDER_UNAVAILABLE");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      temperature: 0.2,
      messages: [{ role: "user", content: buildTranslationPrompt(input) }],
    }),
  });

  if (!res.ok) throw new Error("PROVIDER_ERROR");

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const content = data.content?.find((c) => c.type === "text")?.text;
  if (!content) throw new Error("INVALID_RESPONSE");

  const parsed = parseTranslationResponse(content);
  return { ...parsed, provider: "anthropic" };
}

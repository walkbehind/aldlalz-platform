import { isTranslationConfigured, resolveProviderOrder } from "./config";
import { translateWithAnthropic } from "./providers/anthropic";
import { translateWithGoogle } from "./providers/google";
import { translateWithOpenAi } from "./providers/openai";
import type {
  LocaleCode,
  TranslateListingInput,
  TranslateListingResult,
  TranslationProviderName,
} from "./types";

export { isTranslationConfigured, getConfiguredProviders } from "./config";
export type { LocaleCode, TranslateListingInput, TranslateListingResult };

const runners: Record<
  TranslationProviderName,
  (input: TranslateListingInput) => Promise<TranslateListingResult>
> = {
  openai: translateWithOpenAi,
  anthropic: translateWithAnthropic,
  google: translateWithGoogle,
};

export async function translateListingContent(
  input: TranslateListingInput
): Promise<TranslateListingResult> {
  if (!input.title.trim()) throw new Error("TITLE_REQUIRED");
  if (input.from === input.to) throw new Error("SAME_LOCALE");
  if (!isTranslationConfigured()) throw new Error("NOT_CONFIGURED");

  const order = resolveProviderOrder();
  if (order.length === 0) throw new Error("NOT_CONFIGURED");

  let lastError: unknown;
  for (const provider of order) {
    try {
      return await runners[provider](input);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("TRANSLATION_FAILED");
}

export function oppositeLocale(locale: LocaleCode): LocaleCode {
  return locale === "ar" ? "en" : "ar";
}

import type { TranslationProviderName } from "./types";

export function getOpenAiKey() {
  return process.env.OPENAI_API_KEY ?? "";
}

export function getAnthropicKey() {
  return process.env.ANTHROPIC_API_KEY ?? "";
}

export function getGoogleAiKey() {
  return process.env.GOOGLE_AI_API_KEY ?? "";
}

export function getTranslationProviderPreference():
  | TranslationProviderName
  | "auto" {
  const raw = process.env.TRANSLATION_PROVIDER?.toLowerCase();
  if (raw === "openai" || raw === "anthropic" || raw === "google") return raw;
  return "auto";
}

export function isTranslationConfigured() {
  return !!(getOpenAiKey() || getAnthropicKey() || getGoogleAiKey());
}

export function getConfiguredProviders(): TranslationProviderName[] {
  const providers: TranslationProviderName[] = [];
  if (getOpenAiKey()) providers.push("openai");
  if (getAnthropicKey()) providers.push("anthropic");
  if (getGoogleAiKey()) providers.push("google");
  return providers;
}

export function resolveProviderOrder(): TranslationProviderName[] {
  const configured = getConfiguredProviders();
  const pref = getTranslationProviderPreference();
  if (pref !== "auto") {
    return configured.includes(pref)
      ? [pref, ...configured.filter((p) => p !== pref)]
      : configured;
  }
  return configured;
}

export const OPENAI_MODEL =
  process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4o-mini";
export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_TRANSLATION_MODEL ?? "claude-3-5-haiku-20241022";
export const GOOGLE_MODEL =
  process.env.GOOGLE_TRANSLATION_MODEL ?? "gemini-2.0-flash";

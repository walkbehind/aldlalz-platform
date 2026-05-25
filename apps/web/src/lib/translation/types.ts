export type LocaleCode = "ar" | "en";

export type TranslationProviderName = "openai" | "anthropic" | "google";

export type TranslateListingInput = {
  title: string;
  description?: string;
  from: LocaleCode;
  to: LocaleCode;
};

export type TranslateListingResult = {
  title: string;
  description: string;
  provider: TranslationProviderName;
};

export type TranslationProvider = {
  name: TranslationProviderName;
  translate: (input: TranslateListingInput) => Promise<TranslateListingResult>;
};

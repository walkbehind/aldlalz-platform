"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { oppositeLocale, type LocaleCode } from "@/lib/translation";

export type ListingBilingualFieldsHandle = {
  ensureTranslated: () => Promise<boolean>;
};

export type TranslationLabels = {
  title: string;
  description: string;
  primaryHint: string;
  autoFilled: string;
  translating: string;
  translateNow: string;
  editTranslation: string;
  translationPreviewAr: string;
  translationPreviewEn: string;
  translationFailed: string;
  notConfigured: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

type Props = {
  locale: string;
  translationEnabled: boolean;
  labels: TranslationLabels;
  initialTitleAr?: string;
  initialTitleEn?: string;
  initialDescriptionAr?: string;
  initialDescriptionEn?: string;
};

async function callTranslateApi(
  title: string,
  description: string,
  from: LocaleCode,
  to: LocaleCode
) {
  const res = await fetch("/api/translate", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, from, to }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "TRANSLATION_FAILED");
  }
  return data as { title: string; description: string; provider: string };
}

export const ListingBilingualFields = forwardRef<
  ListingBilingualFieldsHandle,
  Props
>(function ListingBilingualFields(
  {
    locale,
    translationEnabled,
    labels,
    initialTitleAr = "",
    initialTitleEn = "",
    initialDescriptionAr = "",
    initialDescriptionEn = "",
  },
  ref
) {
  const primaryLocale = (locale === "en" ? "en" : "ar") as LocaleCode;
  const secondaryLocale = oppositeLocale(primaryLocale);

  const [titleAr, setTitleAr] = useState(initialTitleAr);
  const [titleEn, setTitleEn] = useState(initialTitleEn);
  const [descriptionAr, setDescriptionAr] = useState(initialDescriptionAr);
  const [descriptionEn, setDescriptionEn] = useState(initialDescriptionEn);

  const primaryTitle = primaryLocale === "ar" ? titleAr : titleEn;
  const primaryDescription =
    primaryLocale === "ar" ? descriptionAr : descriptionEn;
  const secondaryTitle = secondaryLocale === "ar" ? titleAr : titleEn;
  const secondaryDescription =
    secondaryLocale === "ar" ? descriptionAr : descriptionEn;

  const setPrimaryTitle = (v: string) =>
    primaryLocale === "ar" ? setTitleAr(v) : setTitleEn(v);
  const setPrimaryDescription = (v: string) =>
    primaryLocale === "ar" ? setDescriptionAr(v) : setDescriptionEn(v);

  const applySecondary = (title: string, description: string) => {
    if (secondaryLocale === "ar") {
      setTitleAr(title);
      setDescriptionAr(description);
    } else {
      setTitleEn(title);
      setDescriptionEn(description);
    }
  };

  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualSecondary, setShowManualSecondary] = useState(false);
  const [lastTranslatedKey, setLastTranslatedKey] = useState<string | null>(
    () => {
      const sec =
        secondaryLocale === "ar" ? initialTitleAr : initialTitleEn;
      const pri =
        primaryLocale === "ar" ? initialTitleAr : initialTitleEn;
      const priDesc =
        primaryLocale === "ar" ? initialDescriptionAr : initialDescriptionEn;
      if (sec.trim().length >= 3) {
        return `${pri.trim()}|${(priDesc ?? "").trim()}`;
      }
      return null;
    }
  );

  const skipInitialAutoTranslate = useRef(
    (secondaryLocale === "ar" ? initialTitleAr : initialTitleEn).trim()
      .length >= 3
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sourceKey = `${primaryTitle.trim()}|${primaryDescription.trim()}`;

  const runTranslate = useCallback(async (): Promise<boolean> => {
    if (!translationEnabled) return true;
    if (primaryTitle.trim().length < 3) return true;

    setTranslating(true);
    setError(null);

    try {
      const result = await callTranslateApi(
        primaryTitle.trim(),
        primaryDescription.trim(),
        primaryLocale,
        secondaryLocale
      );
      applySecondary(result.title, result.description);
      setLastTranslatedKey(sourceKey);
      return true;
    } catch {
      setError(labels.translationFailed);
      return false;
    } finally {
      setTranslating(false);
    }
  }, [
    translationEnabled,
    primaryTitle,
    primaryDescription,
    primaryLocale,
    secondaryLocale,
    sourceKey,
    labels.translationFailed,
  ]);

  useImperativeHandle(ref, () => ({
    ensureTranslated: async () => {
      if (!translationEnabled) return true;
      if (primaryTitle.trim().length < 3) return true;
      if (
        secondaryTitle.trim().length >= 3 &&
        lastTranslatedKey === sourceKey
      ) {
        return true;
      }
      return runTranslate();
    },
  }));

  useEffect(() => {
    if (!translationEnabled || showManualSecondary) return;
    if (primaryTitle.trim().length < 3) return;

    if (skipInitialAutoTranslate.current) {
      skipInitialAutoTranslate.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate();
    }, 900);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on sourceKey only
  }, [sourceKey, translationEnabled, showManualSecondary]);

  const secondaryLangLabel =
    secondaryLocale === "ar"
      ? labels.translationPreviewAr
      : labels.translationPreviewEn;

  if (!translationEnabled) {
    return (
      <div className="md:col-span-2 space-y-4">
        <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {labels.notConfigured}
        </p>
        <div>
          <Label htmlFor="titleAr">{labels.titleAr}</Label>
          <Input
            id="titleAr"
            name="titleAr"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            required
            dir="rtl"
          />
        </div>
        <div>
          <Label htmlFor="titleEn">{labels.titleEn}</Label>
          <Input
            id="titleEn"
            name="titleEn"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            dir="ltr"
          />
        </div>
        <div>
          <Label htmlFor="descriptionAr">{labels.descriptionAr}</Label>
          <Textarea
            id="descriptionAr"
            name="descriptionAr"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            dir="rtl"
          />
        </div>
        <div>
          <Label htmlFor="descriptionEn">{labels.descriptionEn}</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            dir="ltr"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 space-y-4">
      <p className="text-sm text-text-muted">{labels.primaryHint}</p>

      <div>
        <Label htmlFor="titlePrimary">{labels.title}</Label>
        <Input
          id="titlePrimary"
          value={primaryTitle}
          onChange={(e) => setPrimaryTitle(e.target.value)}
          required
          dir={primaryLocale === "ar" ? "rtl" : "ltr"}
          minLength={3}
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="descriptionPrimary">{labels.description}</Label>
        <Textarea
          id="descriptionPrimary"
          value={primaryDescription}
          onChange={(e) => setPrimaryDescription(e.target.value)}
          dir={primaryLocale === "ar" ? "rtl" : "ltr"}
          maxLength={5000}
        />
      </div>

      <input type="hidden" name="titleAr" value={titleAr} />
      <input type="hidden" name="titleEn" value={titleEn} />
      <input type="hidden" name="descriptionAr" value={descriptionAr} />
      <input type="hidden" name="descriptionEn" value={descriptionEn} />

      <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">{secondaryLangLabel}</span>
          <div className="flex flex-wrap gap-2">
            {translating && (
              <span className="text-xs text-brand-600">{labels.translating}</span>
            )}
            {!translating && secondaryTitle && (
              <span className="text-xs text-text-muted">{labels.autoFilled}</span>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={translating || primaryTitle.trim().length < 3}
              onClick={() => void runTranslate()}
            >
              {labels.translateNow}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowManualSecondary((v) => !v)}
            >
              {labels.editTranslation}
            </Button>
          </div>
        </div>

        {showManualSecondary ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="titleSecondary">{labels.title}</Label>
              <Input
                id="titleSecondary"
                value={secondaryTitle}
                onChange={(e) =>
                  applySecondary(e.target.value, secondaryDescription)
                }
                dir={secondaryLocale === "ar" ? "rtl" : "ltr"}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="descriptionSecondary">{labels.description}</Label>
              <Textarea
                id="descriptionSecondary"
                value={secondaryDescription}
                onChange={(e) =>
                  applySecondary(secondaryTitle, e.target.value)
                }
                dir={secondaryLocale === "ar" ? "rtl" : "ltr"}
                maxLength={5000}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p
              className="font-medium"
              dir={secondaryLocale === "ar" ? "rtl" : "ltr"}
            >
              {secondaryTitle || "—"}
            </p>
            {secondaryDescription && (
              <p
                className="whitespace-pre-wrap text-text-muted"
                dir={secondaryLocale === "ar" ? "rtl" : "ltr"}
              >
                {secondaryDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});

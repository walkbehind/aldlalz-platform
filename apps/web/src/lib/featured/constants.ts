import type {
  FeatureDurationType,
  FeaturePlacementType,
} from "@aldlalz/database";

export const FEATURE_DURATION_DAYS = {
  DAYS_3: 3,
  DAYS_7: 7,
  DAYS_30: 30,
} as const;

export type FeatureDurationKey = keyof typeof FEATURE_DURATION_DAYS;

/** Duration tiers exposed in owner UI today */
export const FEATURE_DURATION_TYPES: FeatureDurationKey[] = [
  "DAYS_3",
  "DAYS_7",
  "DAYS_30",
];

/** @deprecated Use FEATURE_DURATION_TYPES */
export const FEATURE_TYPES = FEATURE_DURATION_TYPES;

/** Placement types — backend-ready; UI exposes FEATURED_BADGE by default */
export const FEATURE_PLACEMENT_TYPES: FeaturePlacementType[] = [
  "FEATURED_BADGE",
  "SEARCH_TOP",
  "HOME_PAGE",
];

export const DEFAULT_FEATURE_PLACEMENT: FeaturePlacementType = "FEATURED_BADGE";

export const DEFAULT_FEATURE_CURRENCY = "KWD";

export function durationDaysForType(type: FeatureDurationType): number {
  return FEATURE_DURATION_DAYS[type as FeatureDurationKey];
}

/** Future pricing table — used when admin approves / payment confirms */
export const FEATURE_PRICE_KWD: Record<
  FeaturePlacementType,
  Record<FeatureDurationKey, number>
> = {
  FEATURED_BADGE: { DAYS_3: 2, DAYS_7: 4, DAYS_30: 12 },
  SEARCH_TOP: { DAYS_3: 5, DAYS_7: 10, DAYS_30: 30 },
  HOME_PAGE: { DAYS_3: 8, DAYS_7: 15, DAYS_30: 45 },
};

export function resolveFeaturePrice(
  placement: FeaturePlacementType,
  duration: FeatureDurationType
): number {
  return FEATURE_PRICE_KWD[placement][duration as FeatureDurationKey];
}

export function appliesHomeFeaturedFlag(placement: FeaturePlacementType): boolean {
  return placement === "FEATURED_BADGE" || placement === "HOME_PAGE";
}

export const FEATURE_DURATION_LABELS: Record<
  FeatureDurationKey,
  { ar: string; en: string }
> = {
  DAYS_3: { ar: "تمييز 3 أيام", en: "Featured 3 days" },
  DAYS_7: { ar: "تمييز 7 أيام", en: "Featured 7 days" },
  DAYS_30: { ar: "تمييز 30 يوماً", en: "Featured 30 days" },
};

export const FEATURE_PLACEMENT_LABELS: Record<
  FeaturePlacementType,
  { ar: string; en: string }
> = {
  FEATURED_BADGE: { ar: "شارة مميز", en: "Featured badge" },
  SEARCH_TOP: { ar: "أعلى نتائج البحث", en: "Search top" },
  HOME_PAGE: { ar: "الصفحة الرئيسية", en: "Home page" },
};

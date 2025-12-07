export const SUPPORTED_LANGUAGES = ["id", "en"] as const;

export const DEFAULT_LANGUAGE = "id";

export const FALLBACK_LANGUAGE = "en";

export const LANGUAGE_NAMES = {
    id: "Indonesia",
    en: "English",
} as const;

export const LANGUAGE_FLAGS = {
    id: "🇮🇩",
    en: "🇬🇧",
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

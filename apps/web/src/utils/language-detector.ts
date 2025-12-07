import {
    SUPPORTED_LANGUAGES,
    FALLBACK_LANGUAGE,
    SupportedLanguage,
} from "@/i18n/settings";

/**
 * Parse Accept-Language header dari browser
 * Contoh: "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
 * Return: ['id', 'en', ...]
 */
export function parseAcceptLanguage(acceptLanguageHeader: string): string[] {
    return acceptLanguageHeader.split(",").map((lang) => {
        const [language] = lang.trim().split(";");
        return language.split("-")[0].toLowerCase();
    });
}

/**
 * Deteksi bahasa dari browser
 * Input: Accept-Language header
 * Return: Bahasa yang didukung atau fallback
 */
export function detectBrowserLanguage(
    acceptLanguageHeader: string,
): SupportedLanguage {
    const languages = parseAcceptLanguage(acceptLanguageHeader);

    // Cari bahasa pertama yang didukung
    for (const lang of languages) {
        if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
            return lang as SupportedLanguage;
        }
    }

    // Jika tidak ada yang cocok, gunakan fallback
    return FALLBACK_LANGUAGE;
}

import { SupportedLanguage, SUPPORTED_LANGUAGES } from "@/i18n/settings";
import idDictionary from "@/dictionaries/id.json";
import enDictionary from "@/dictionaries/en.json";

// Simpan kamus dalam memory
const dictionaries: Record<SupportedLanguage, Record<string, any>> = {
    id: idDictionary as Record<string, any>,
    en: enDictionary as Record<string, any>,
};

/**
 * Ambil teks dari kamus
 * Gunakan dot notation untuk nested keys
 *
 * Contoh:
 * getDictionary('id')('hero.title')
 * → "Selamat Datang di Uxie"
 */
export function getDictionary(lang: SupportedLanguage) {
    return (key: string): string => {
        const keys = key.split(".");
        let value: any = dictionaries[lang];

        for (const k of keys) {
            if (value && typeof value === "object") {
                value = value[k];
            } else {
                return key; // Return key itself jika tidak ketemu
            }
        }

        return typeof value === "string" ? value : key;
    };
}

/**
 * Validasi bahasa
 */
export function isValidLanguage(lang: any): lang is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(lang);
}

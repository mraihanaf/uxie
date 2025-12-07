import { SupportedLanguage } from "@/i18n/settings";
import { cookies } from "next/headers";

const LANGUAGE_COOKIE_NAME = "uxie-language";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 tahun

/**
 * Set cookie bahasa user
 * Dipanggil ketika user memilih bahasa di settings
 */
export async function setLanguageCookie(language: SupportedLanguage) {
    const cookieStore = await cookies();
    cookieStore.set(LANGUAGE_COOKIE_NAME, language, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
    });
}

/**
 * Ambil cookie bahasa user
 * Dipanggil oleh middleware & server components
 */
export async function getLanguageCookie(): Promise<SupportedLanguage | null> {
    const cookieStore = await cookies();
    return (
        (cookieStore.get(LANGUAGE_COOKIE_NAME)?.value as SupportedLanguage) ||
        null
    );
}

/**
 * Hapus cookie bahasa
 * Dipanggil saat logout atau reset
 */
export async function deleteLanguageCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(LANGUAGE_COOKIE_NAME);
}

import { NextRequest, NextResponse } from "next/server";
import {
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    SupportedLanguage,
} from "@/i18n/settings";
import { detectBrowserLanguage } from "@/utils/language-detector";

/**
 * Validasi bahasa
 */
function isValidLanguage(lang: any): lang is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(lang);
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Cek apakah user sudah punya cookie bahasa
    const languageCookie = request.cookies.get("uxie-language")?.value;

    if (languageCookie && isValidLanguage(languageCookie)) {
        // User sudah punya pilihan bahasa, lanjutkan ke halaman
        return NextResponse.next();
    }

    // 2. Jika belum ada cookie, deteksi dari browser
    const acceptLanguage = request.headers.get("accept-language") || "";
    const detectedLanguage = detectBrowserLanguage(acceptLanguage);

    // 3. Buat response dengan set cookie otomatis
    const response = NextResponse.next();
    response.cookies.set("uxie-language", detectedLanguage, {
        maxAge: 365 * 24 * 60 * 60, // 1 tahun
        path: "/",
        httpOnly: true,
        sameSite: "lax",
    });

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

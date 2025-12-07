import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // Daftar bahasa yang resmi didukung
    locales: ["en", "id"],

    // FALLBACK LOGIC:
    // Jika user dari Jepang (ja) masuk, karena 'ja' tidak ada di list 'locales',
    // sistem otomatis melempar ke 'defaultLocale' ini (Inggris).
    defaultLocale: "en",

    // Selalu gunakan locale prefix untuk konsistensi
    localePrefix: "always",
});

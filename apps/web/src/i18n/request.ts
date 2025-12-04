import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    // Validasi: Pastikan locale yang diminta ada di list kita.
    let locale = await requestLocale;

    // Jika locale tidak valid/tidak ada, paksa gunakan default (en)
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Load file JSON yang sesuai secara dinamis
    // Menggunakan relative path dari i18n folder ke messages folder
    const messages =
        locale === "id"
            ? (await import("../messages/id.json")).default
            : (await import("../messages/en.json")).default;

    return {
        locale,
        messages,
    };
});

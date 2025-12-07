import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SupportedLanguage, SUPPORTED_LANGUAGES } from "@/i18n/settings";

export async function POST(request: NextRequest) {
    try {
        const { language } = await request.json();

        if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
            return NextResponse.json(
                { error: "Invalid language" },
                { status: 400 },
            );
        }

        const cookieStore = await cookies();
        cookieStore.set("uxie-language", language, {
            maxAge: 365 * 24 * 60 * 60, // 1 tahun
            path: "/",
            httpOnly: true,
            sameSite: "lax",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to set language" },
            { status: 500 },
        );
    }
}

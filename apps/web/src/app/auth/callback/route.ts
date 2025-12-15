import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    // Always redirect to /app on successful authentication
    const redirectTo = "/app";
    const origin = requestUrl.origin;

    if (!code) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    // Track all cookies across multiple setAll calls
    const allCookies: Array<{
        name: string;
        value: string;
        options?: Parameters<typeof NextResponse.prototype.cookies.set>[2];
    }> = [];

    // Create a mutable response object that will be updated in setAll callback
    let response = NextResponse.redirect(`${origin}${redirectTo}`);

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update request cookies
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    // Accumulate all cookies (update existing or add new)
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const existingIndex = allCookies.findIndex(
                            (c) => c.name === name,
                        );
                        if (existingIndex >= 0) {
                            allCookies[existingIndex] = {
                                name,
                                value,
                                options,
                            };
                        } else {
                            allCookies.push({ name, value, options });
                        }
                    });
                    // Recreate redirect response and set ALL accumulated cookies
                    // This ensures we don't lose cookies from previous setAll calls
                    response = NextResponse.redirect(`${origin}${redirectTo}`);
                    allCookies.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                    console.log(
                        `OAuth callback: setAll called with ${cookiesToSet.length} cookies, total: ${allCookies.length}`,
                    );
                },
            },
        },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`,
        );
    }

    // Verify session was created by checking user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error("User not found after code exchange");
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    // Successfully authenticated - return redirect response with cookies
    // The response object has been updated in setAll callback with all cookies
    const responseCookies = response.cookies.getAll();
    console.log(
        `OAuth callback: User authenticated, redirecting to ${redirectTo} with ${responseCookies.length} cookies in response`,
    );
    if (responseCookies.length === 0) {
        console.error(
            "OAuth callback: WARNING - No cookies in response! This will cause authentication to fail.",
        );
    }
    return response;
}

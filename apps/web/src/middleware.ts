import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Simple middleware - no locale redirect
    // Just pass through to the route
    return NextResponse.next();
}

export const config = {
    // Matcher agar middleware tidak memproses file gambar/api/dll
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};

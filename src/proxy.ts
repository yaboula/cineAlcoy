// ─────────────────────────────────────────────────────────────────────────────
// Next.js Proxy — refreshes Supabase Auth session on every request
// and protects authenticated-only routes.
// (Next.js 16: "middleware" renamed to "proxy")
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Routes that require an active session */
const PROTECTED_ROUTES = ["/profile", "/watchlist"];

/** Routes only for guests (redirect to / if already logged in) */
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Skip if Supabase isn't configured
  if (!SUPABASE_URL.startsWith("https://") || SUPABASE_KEY.length < 20) {
    return response;
  }

  // Create a server client that can read AND write cookies on the response
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Forward cookie writes to the response
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session (important: this updates the auth cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Protected routes: redirect to /login if not authenticated ──
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Guest-only routes: redirect to / if already logged in ──
  if (user && GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run middleware on all routes except static files & API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

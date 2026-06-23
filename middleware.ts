import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that an unauthenticated user is allowed to reach.
// /auth/callback MUST be public — it's where the magic-link code is exchanged
// for a session. If the middleware redirects it to /login, the `?code` is lost
// and login can never complete.
const PUBLIC_PREFIXES = ["/login", "/auth"];

export async function middleware(request: NextRequest) {
  // A single response object is reused so that any refreshed Supabase auth
  // cookies are written back to the same response we ultimately return.
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refreshes the session and keeps cookies fresh on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Remember where the user was headed. A cookie is more reliable than a query
    // param because the magic-link URL must exactly match Supabase's whitelist.
    redirectResponse.cookies.set("post_login_redirect", pathname, {
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });
    return redirectResponse;
  }

  // Already signed in but sitting on /login? Send them home.
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Run on everything except static assets. /auth/callback is handled above.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

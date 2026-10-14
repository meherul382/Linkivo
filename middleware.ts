import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const protectedPath = ["/", "/links", "/analytics", "/login"].includes(request.nextUrl.pathname)
      || request.nextUrl.pathname.startsWith("/analytics/")
      || request.nextUrl.pathname.startsWith("/api/links")
      || request.nextUrl.pathname.startsWith("/api/analytics/");
    if (protectedPath && request.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (path === "/login") {
    if (user) return NextResponse.redirect(new URL("/", request.url));
    return response;
  }
  const protectedPath = path === "/" || path === "/links" || path === "/analytics"
    || path.startsWith("/analytics/") || path === "/api/links"
    || path.startsWith("/api/analytics/");
  if (protectedPath && !user) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = { matcher: ["/", "/links", "/analytics", "/analytics/:path*", "/api/links", "/api/links/:path*", "/api/analytics/:path*", "/login"] };

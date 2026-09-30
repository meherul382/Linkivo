import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = "https://eeldlrstipmafirjvogl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EQKZh3BiLS33PRLPwu5Gog_bBPHMHhv";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname=request.nextUrl.pathname;

  if (pathname === "/login") {
    if (user) return NextResponse.redirect(new URL("/", request.url));
    return response;
  }

  const protectedPath =
    pathname === "/" ||
    pathname === "/links" ||
    pathname === "/analytics" ||
    pathname.startsWith("/analytics/") ||
    pathname === "/api/links" ||
    pathname.startsWith("/api/analytics/");

  if (protectedPath && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/links", "/analytics", "/analytics/:path*", "/api/links", "/api/analytics/:path*", "/login"],
};

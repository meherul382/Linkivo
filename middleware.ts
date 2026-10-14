import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifyDashboardSession } from "./lib/dashboard-session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.LINKIVO_SESSION_SECRET;
  const valid = await verifyDashboardSession(request.cookies.get(sessionCookieName())?.value, secret);
  if (path === "/login") {
    if (valid) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  const protectedPage = path === "/" || path === "/links" || path === "/analytics"
    || path.startsWith("/analytics/")
    || path === "/api/links" || path.startsWith("/api/links/")
    || path.startsWith("/api/analytics/")
    || path === "/api/session/logout";
  if (protectedPage && !valid) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Dashboard authentication required." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/links", "/analytics", "/analytics/:path*", "/api/links", "/api/links/:path*", "/api/analytics/:path*", "/api/session/logout", "/login"],
};

import { NextRequest, NextResponse } from "next/server";
import { createDashboardSession, sessionCookieName, sessionMaxAge } from "../../../../lib/dashboard-session";

export async function POST(request: NextRequest) {
  const password = process.env.LINKIVO_DASHBOARD_PASSWORD;
  const secret = process.env.LINKIVO_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) {
    return NextResponse.json({ error: "Dashboard access is not configured. Add LINKIVO_DASHBOARD_PASSWORD and a 32+ character LINKIVO_SESSION_SECRET in Vercel." }, { status: 503 });
  }
  let submitted = "";
  try { submitted = String((await request.json())?.password ?? ""); }
  catch { return NextResponse.json({ error: "Enter your dashboard password." }, { status: 400 }); }
  const a = new TextEncoder().encode(submitted);
  const b = new TextEncoder().encode(password);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  if (diff !== 0) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const token = await createDashboardSession(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionMaxAge() });
  return response;
}

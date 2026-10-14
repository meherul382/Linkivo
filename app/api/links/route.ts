import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase/server";

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,40}$/;

async function auth() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function validUrl(value: string) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) && value.length <= 2048;
  } catch { return false; }
}

export async function GET() {
  const { supabase, user } = await auth();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.rpc("linkivo_list_links");
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load links. Apply supabase/schema.sql first." }, { status: 500 });
  }
  const rows = Array.isArray(data) ? data : [];
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return NextResponse.json({ links: rows.map((link: any) => ({
    slug: link.slug, shortUrl: base + "/" + link.slug, destinationUrl: link.destination_url,
    createdAt: link.created_at, clicks: Number(link.clicks || 0), isActive: link.is_active
  })) });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await auth();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json();
    const destinationUrl = String(body?.url ?? "").trim();
    const requestedAlias = String(body?.alias ?? "").trim();
    if (!validUrl(destinationUrl)) return NextResponse.json({ error: "Enter a valid http or https URL." }, { status: 400 });
    if (requestedAlias && !ALIAS_RE.test(requestedAlias)) {
      return NextResponse.json({ error: "Alias must be 3–40 characters using letters, numbers, - or _." }, { status: 400 });
    }
    const slug = requestedAlias || crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const { data, error } = await supabase.rpc("linkivo_create_link", {
      p_slug: slug, p_destination_url: destinationUrl
    });
    if (error) {
      if (error.message.includes("ALIAS_TAKEN")) return NextResponse.json({ error: "That alias is already used." }, { status: 409 });
      if (error.message.includes("AUTH_REQUIRED")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      console.error(error);
      return NextResponse.json({ error: "Could not create the link. Check the database schema." }, { status: 500 });
    }
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    return NextResponse.json({
      slug: data.slug, destinationUrl: data.destination_url, shortUrl: base + "/" + data.slug,
      createdAt: data.created_at, clicks: 0
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
  }
}

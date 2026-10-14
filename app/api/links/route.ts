import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

const ALIAS = /^[a-zA-Z0-9_-]{3,40}$/;
function validUrl(value: string) {
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && value.length <= 2048; }
  catch { return false; }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("linkivo_links").select("slug,destination_url,created_at,clicks,is_active").eq("is_active", true).order("created_at", { ascending: false });
    if (error) throw error;
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    return NextResponse.json({ links: (data || []).map(l => ({ slug: l.slug, shortUrl: base ? base + "/" + l.slug : "/" + l.slug, destinationUrl: l.destination_url, createdAt: l.created_at, clicks: Number(l.clicks || 0) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load links. Check server-only Supabase credentials and schema." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = String(body?.url ?? "").trim();
    const alias = String(body?.alias ?? "").trim();
    if (!validUrl(url)) return NextResponse.json({ error: "Enter a valid http or https URL." }, { status: 400 });
    if (alias && !ALIAS.test(alias)) return NextResponse.json({ error: "Alias must be 3–40 characters using letters, numbers, - or _." }, { status: 400 });
    const slug = alias || crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("linkivo_links").insert({ slug, destination_url: url, is_active: true, clicks: 0 }).select("slug,destination_url,created_at,clicks").single();
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "That alias is already in use." }, { status: 409 });
      console.error(error);
      return NextResponse.json({ error: "Could not create the link. Check Supabase schema." }, { status: 500 });
    }
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    return NextResponse.json({ slug: data.slug, destinationUrl: data.destination_url, shortUrl: base + "/" + data.slug, createdAt: data.created_at, clicks: Number(data.clicks || 0) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
  }
}

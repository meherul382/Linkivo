import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase/server";

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,40}$/;

async function requireUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data, error } = await supabase.rpc("linkivo_list_links");
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load links." }, { status: 500 });
  }

  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://canvalives.com").replace(/\/$/, "");
  const rows = Array.isArray(data) ? data : [];
  return NextResponse.json({
    links: rows.map((link:any)=>({
      slug: link.slug,
      shortUrl: `${origin}/${link.slug}`,
      destinationUrl: link.destination_url,
      createdAt: link.created_at,
      clicks: Number(link.clicks || 0),
    }))
  });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json();
    const destinationUrl = String(body?.url ?? "").trim();
    const requestedAlias = String(body?.alias ?? "").trim();
    const slug = requestedAlias || Math.random().toString(36).slice(2, 8);

    if (!/^https?:\/\//i.test(destinationUrl) || destinationUrl.length > 2048) {
      return NextResponse.json({ error: "Please enter a valid http/https URL." }, { status: 400 });
    }
    if (requestedAlias && !ALIAS_RE.test(requestedAlias)) {
      return NextResponse.json({ error: "Alias must be 3–40 characters using letters, numbers, - or _." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("linkivo_create_link", {
      p_slug: slug,
      p_destination_url: destinationUrl,
    });

    if (error) {
      if (error.message.includes("AUTH_REQUIRED")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      if (error.message.includes("ALIAS_TAKEN")) return NextResponse.json({ error: "That alias is already in use. Try another one." }, { status: 409 });
      if (error.message.includes("INVALID_")) return NextResponse.json({ error: "Invalid link information." }, { status: 400 });
      console.error(error);
      return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
    }

    const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://canvalives.com").replace(/\/$/, "");
    return NextResponse.json({
      slug: data.slug,
      destinationUrl: data.destination_url,
      shortUrl: `${origin}/${data.slug}`,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
  }
}
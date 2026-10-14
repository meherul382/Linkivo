import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";

async function auth() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const { supabase, user } = await auth();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json();
    const destinationUrl = String(body?.destinationUrl ?? "").trim();
    let parsed: URL;
    try { parsed = new URL(destinationUrl); } catch { return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 }); }
    if (!["http:", "https:"].includes(parsed.protocol) || destinationUrl.length > 2048) {
      return NextResponse.json({ error: "Destination must be an http or https URL." }, { status: 400 });
    }
    const { data, error } = await supabase.rpc("linkivo_update_destination", {
      p_slug: slug, p_destination_url: destinationUrl
    });
    if (error) {
      if (error.message.includes("LINK_NOT_FOUND")) return NextResponse.json({ error: "Link not found." }, { status: 404 });
      console.error(error);
      return NextResponse.json({ error: "Could not update destination." }, { status: 500 });
    }
    return NextResponse.json({ slug: data.slug, destinationUrl: data.destination_url });
  } catch { return NextResponse.json({ error: "Could not update destination." }, { status: 400 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const { supabase, user } = await auth();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.rpc("linkivo_archive_link", { p_slug: slug });
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not archive link." }, { status: 500 });
  }
  if (data !== true) return NextResponse.json({ error: "Link not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

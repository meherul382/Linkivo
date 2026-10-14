import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const body = await request.json();
    const destinationUrl = String(body?.destinationUrl ?? "").trim();
    let parsed: URL;
    try { parsed = new URL(destinationUrl); } catch { return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 }); }
    if (!["http:", "https:"].includes(parsed.protocol) || destinationUrl.length > 2048) return NextResponse.json({ error: "Destination must be an http or https URL." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("linkivo_links").update({ destination_url: destinationUrl, updated_at: new Date().toISOString() }).eq("slug", slug).eq("is_active", true).select("slug,destination_url").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ slug: data.slug, destinationUrl: data.destination_url });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Could not update destination." }, { status: 500 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("linkivo_links").update({ is_active: false, updated_at: new Date().toISOString() }).eq("slug", slug).eq("is_active", true).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Could not archive link." }, { status: 500 }); }
}

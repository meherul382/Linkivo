import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json();
    const destinationUrl = String(body?.destinationUrl ?? "").trim();
    const { data, error } = await supabase.rpc("linkivo_update_destination", {
      p_slug: slug,
      p_destination_url: destinationUrl,
    });
    if (error) {
      if (error.message.includes("AUTH_REQUIRED")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      if (error.message.includes("INVALID_URL")) return NextResponse.json({ error: "Please enter a valid http/https URL." }, { status: 400 });
      if (error.message.includes("LINK_NOT_FOUND")) return NextResponse.json({ error: "Link not found." }, { status: 404 });
      console.error(error);
      return NextResponse.json({ error: "Could not update the destination URL." }, { status: 500 });
    }
    return NextResponse.json({slug:data.slug,destinationUrl:data.destination_url,shortUrl:"https://"+data.short_domain+"/"+data.slug,updatedAt:data.updated_at});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update the destination URL." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.rpc("linkivo_archive_link", { p_slug: slug });
  if (error) return NextResponse.json({ error: "Could not remove the link from My Links." }, { status: 500 });
  if (data !== true) return NextResponse.json({ error: "Link not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Removed from My Links. The short URL still works." });
}

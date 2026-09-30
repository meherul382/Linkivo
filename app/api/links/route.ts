import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,40}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const destinationUrl = String(body?.url ?? "").trim();
    const alias = String(body?.alias ?? "").trim();

    if (!/^https?:\/\//i.test(destinationUrl)) {
      return NextResponse.json({ error: "Please enter a valid http/https URL." }, { status: 400 });
    }

    if (destinationUrl.length > 2048) {
      return NextResponse.json({ error: "URL is too long." }, { status: 400 });
    }

    if (alias && !ALIAS_RE.test(alias)) {
      return NextResponse.json(
        { error: "Alias must be 3–40 characters using letters, numbers, - or _." },
        { status: 400 }
      );
    }

    const slug = alias || Math.random().toString(36).slice(2, 9);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("links")
      .insert({ slug, destination_url: destinationUrl })
      .select("slug, destination_url")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That alias is already in use. Try another one." }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
    }

    const origin = request.nextUrl.origin;
    return NextResponse.json({
      slug: data.slug,
      destinationUrl: data.destination_url,
      shortUrl: `${origin}/${data.slug}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
  }
}

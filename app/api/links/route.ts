import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,40}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const destinationUrl = String(body?.url ?? "").trim();
    const requestedAlias = String(body?.alias ?? "").trim();
    const slug = requestedAlias || Math.random().toString(36).slice(2, 9);

    if (!/^https?:\/\//i.test(destinationUrl) || destinationUrl.length > 2048) {
      return NextResponse.json({ error: "Please enter a valid http/https URL." }, { status: 400 });
    }
    if (requestedAlias && !ALIAS_RE.test(requestedAlias)) {
      return NextResponse.json({ error: "Alias must be 3–40 characters using letters, numbers, - or _." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("linkivo_create_link", {
      p_slug: slug,
      p_destination_url: destinationUrl,
    });

    if (error) {
      if (error.message.includes("ALIAS_TAKEN")) {
        return NextResponse.json({ error: "That alias is already in use. Try another one." }, { status: 409 });
      }
      if (error.message.includes("INVALID_")) {
        return NextResponse.json({ error: "Invalid link information." }, { status: 400 });
      }
      console.error(error);
      return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
    }

    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || "https://linkivo-nu.vercel.app").replace(/\/$/, "");

    // Verify the same slug can be resolved immediately before returning it.
    const { data: resolved, error: resolveError } = await supabase.rpc("linkivo_resolve_link", {
      p_slug: data.slug,
    });
    const resolvedRow = Array.isArray(resolved) ? resolved[0] : resolved;

    if (resolveError || !resolvedRow?.destination_url || !resolvedRow.is_active) {
      console.error("Link verification failed:", resolveError);
      return NextResponse.json(
        { error: "The link was created but could not be verified. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slug: data.slug,
      destinationUrl: resolvedRow.destination_url,
      shortUrl: `${appOrigin}/${data.slug}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create the short link." }, { status: 500 });
  }
}

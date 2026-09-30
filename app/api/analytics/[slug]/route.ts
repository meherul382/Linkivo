import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("linkivo_get_analytics", { p_slug: slug });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Short link not found." }, { status: 404 });

  return NextResponse.json(data);
}

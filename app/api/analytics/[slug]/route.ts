import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data, error } = await supabase.rpc("linkivo_get_analytics", { p_slug: slug });
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  return NextResponse.json(data);
}
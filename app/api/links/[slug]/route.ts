import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("linkivo_archive_link", {
    p_slug: slug,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not remove the link from My Links." },
      { status: 500 }
    );
  }

  if (data !== true) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Removed from My Links. The short URL still works.",
  });
}

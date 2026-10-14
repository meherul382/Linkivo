import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: link, error: linkError } = await supabase.from("linkivo_links").select("id,slug,destination_url,clicks,is_active").eq("slug", slug).maybeSingle();
    if (linkError) throw linkError;
    if (!link || !link.is_active) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    const { data: events, error } = await supabase.from("linkivo_click_events").select("clicked_at,country,device_type,browser").eq("link_id", link.id).order("clicked_at", { ascending: false }).limit(1000);
    if (error) throw error;
    const rows = events || [];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const countBy = (key: "country" | "device_type" | "browser") => {
      const counts = new Map<string, number>();
      for (const row of rows) { const label = row[key] || "Unknown"; counts.set(label, (counts.get(label) || 0) + 1); }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    };
    return NextResponse.json({
      link: { slug: link.slug, destination_url: link.destination_url, clicks: Number(link.clicks || 0), short_domain: null },
      todayClicks: rows.filter(row => new Date(row.clicked_at).getTime() >= todayStart.getTime()).length,
      trackedEvents: rows.length,
      countries: countBy("country"), devices: countBy("device_type"), browsers: countBy("browser"),
      recent: rows.slice(0, 20)
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }
}

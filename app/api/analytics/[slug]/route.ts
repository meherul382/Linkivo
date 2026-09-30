import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = getSupabaseAdmin();

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("id, slug, destination_url, clicks, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (linkError || !link) {
    return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  }

  const { data: events, error: eventsError } = await supabase
    .from("click_events")
    .select("clicked_at,country,city,device_type,browser,os,referrer")
    .eq("link_id", link.id)
    .order("clicked_at", { ascending: false })
    .limit(500);

  if (eventsError) {
    return NextResponse.json({ error: "Could not load analytics." }, { status: 500 });
  }

  const rows = events || [];
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todayClicks = rows.filter((event) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(event.clicked_at)) === today
  ).length;

  const countBy = (key: keyof typeof rows[number]) => {
    const map: Record<string, number> = {};
    for (const event of rows) {
      const value = String(event[key] || "Unknown");
      map[value] = (map[value] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  return NextResponse.json({
    link,
    todayClicks,
    countries: countBy("country"),
    devices: countBy("device_type"),
    browsers: countBy("browser"),
    recent: rows.slice(0, 20),
  });
}

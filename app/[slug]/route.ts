import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function parseDevice(userAgent: string) {
  if (/bot|crawler|spider|slurp|facebookexternalhit|preview/i.test(userAgent)) return "bot";
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/i.test(userAgent)) return "mobile";
  return "desktop";
}

function parseBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  return "Other";
}

function parseOs(userAgent: string) {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ios/i.test(userAgent)) return "iOS";
  if (/mac os/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!/^[a-zA-Z0-9_-]{3,40}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid short link." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: link, error } = await supabase
    .from("links")
    .select("id, destination_url, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !link || !link.is_active) {
    return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = ip
    ? createHash("sha256").update(ip + (process.env.ANALYTICS_SALT || "linkivo")).digest("hex")
    : null;

  const country = request.headers.get("x-vercel-ip-country");
  const city = request.headers.get("x-vercel-ip-city");
  const referrer = request.headers.get("referer");

  const { error: eventError } = await supabase.from("click_events").insert({
    link_id: link.id,
    country,
    city,
    device_type: parseDevice(userAgent),
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
    referrer,
    ip_hash: ipHash,
  });

  if (eventError) console.error("Analytics event error:", eventError);

  const { error: countError } = await supabase.rpc("increment_link_clicks", {
    p_link_id: link.id,
  });

  if (countError) {
    console.error("Click counter error:", countError);
  }

  return NextResponse.redirect(link.destination_url, { status: 307 });
}

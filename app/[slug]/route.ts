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
  if (/chrome\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent)) return "Safari";
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
  const { data: link, error } = await supabase.rpc("linkivo_resolve_link", { p_slug: slug });
  const row = Array.isArray(link) ? link[0] : link;

  if (error || !row?.destination_url || !row.is_active) {
    return NextResponse.json({ error: "Short link not found." }, { status: 404 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ipHash = ip ? createHash("sha256").update(ip + "linkivo-analytics").digest("hex") : null;

  const { error: eventError } = await supabase.rpc("linkivo_record_click", {
    p_link_id: row.id,
    p_country: request.headers.get("x-vercel-ip-country"),
    p_city: request.headers.get("x-vercel-ip-city"),
    p_device_type: parseDevice(userAgent),
    p_browser: parseBrowser(userAgent),
    p_os: parseOs(userAgent),
    p_referrer: request.headers.get("referer"),
    p_ip_hash: ipHash,
  });

  if (eventError) console.error("Analytics error:", eventError);

  return NextResponse.redirect(row.destination_url, { status: 307 });
}

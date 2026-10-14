import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

function device(ua: string) {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}
function browser(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua)) return "Safari";
  return "Other";
}
function os(ua: string) {
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ios/i.test(ua)) return "iOS";
  if (/mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-zA-Z0-9_-]{3,40}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid short link." }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("linkivo_resolve_link", { p_slug: slug });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.destination_url || !row.is_active) {
      return NextResponse.json({ error: "Short link not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const destination = new URL(row.destination_url);
    if (!["http:", "https:"].includes(destination.protocol)) {
      return NextResponse.json({ error: "Invalid destination URL." }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot/i.test(ua);
    if (!isBot) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
      const salt = process.env.ANALYTICS_SALT || "linkivo-private";
      const ipHash = ip ? createHash("sha256").update(ip + salt).digest("hex") : null;
      const { error: trackError } = await supabase.rpc("linkivo_record_click", {
        p_link_id: row.id,
        p_country: request.headers.get("x-vercel-ip-country"),
        p_city: request.headers.get("x-vercel-ip-city"),
        p_device_type: device(ua), p_browser: browser(ua), p_os: os(ua),
        p_referrer: request.headers.get("referer"), p_ip_hash: ipHash
      });
      if (trackError) console.error("Linkivo analytics error:", trackError);
    }
    return NextResponse.redirect(destination, {
      status: 302, headers: { "Cache-Control": "no-store", "Referrer-Policy": "strict-origin-when-cross-origin" }
    });
  } catch (error) {
    console.error("Linkivo redirect error:", error);
    return NextResponse.json({ error: "Short link service is not configured yet." }, { status: 500 });
  }
}

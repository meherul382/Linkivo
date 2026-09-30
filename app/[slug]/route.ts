import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(
      { error: "Short link not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot/i.test(userAgent);

  try {
    const destination = new URL(row.destination_url);
    if (!["http:", "https:"].includes(destination.protocol)) {
      return NextResponse.json({ error: "Invalid destination URL." }, { status: 400 });
    }

    // Record real visits when the canvalives preview page is opened.
    // Social crawlers receive the branded preview HTML and are not counted as clicks.
    if (!isBot) {
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
    }

    const shortUrl = "https://" + (row.short_domain || "canvalives.com") + "/" + slug;
    const safeDestination = JSON.stringify(destination.toString())
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026");

    const html = [
      "<!doctype html>",
      "<html lang='en'>",
      "<head>",
      "  <meta charset='utf-8'>",
      "  <meta name='viewport' content='width=device-width,initial-scale=1'>",
      "  <title>canvalives — Continue to your link</title>",
      "  <meta name='description' content='A secure link preview from canvalives.'>",
      "  <meta name='robots' content='noindex,nofollow'>",
      "  <link rel='canonical' href='" + shortUrl + "'>",
      "  <meta property='og:type' content='website'>",
      "  <meta property='og:site_name' content='canvalives'>",
      "  <meta property='og:title' content='canvalives — Link Preview'>",
      "  <meta property='og:description' content='Continue through canvalives to open the shared website.'>",
      "  <meta property='og:url' content='" + shortUrl + "'>",
      "  <meta name='twitter:card' content='summary'>",
      "  <meta name='twitter:title' content='canvalives — Link Preview'>",
      "  <meta name='twitter:description' content='Continue through canvalives to open the shared website.'>",
      "  <style>",
      "    *{box-sizing:border-box}",
      "    html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      "    body{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 15% 15%,rgba(91,92,255,.22),transparent 30%),radial-gradient(circle at 85% 80%,rgba(24,207,255,.14),transparent 32%),#07111f;color:#fff}",
      "    .wrap{width:min(100%,520px);text-align:center}",
      "    .brand{display:inline-flex;align-items:center;gap:10px;font-size:20px;font-weight:800;letter-spacing:-.02em;margin-bottom:24px}",
      "    .logo{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#7658ff,#18cfff);box-shadow:0 12px 35px rgba(60,120,255,.28)}",
      "    .card{padding:38px 30px 30px;border:1px solid rgba(255,255,255,.11);border-radius:28px;background:rgba(10,24,43,.86);box-shadow:0 30px 90px rgba(0,0,0,.35);backdrop-filter:blur(18px)}",
      "    .eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;color:#6edcff;margin:0 0 12px}",
      "    h1{font-size:32px;line-height:1.1;margin:0 0 12px}",
      "    p{color:#91a4bb;line-height:1.65;font-size:14px;margin:0 auto;max-width:390px}",
      "    .loader{width:64px;height:64px;margin:26px auto 20px;border-radius:50%;border:4px solid rgba(255,255,255,.1);border-top-color:#6d63ff;border-right-color:#1bd4ff;animation:spin 1s linear infinite}",
      "    .count{color:#dce8f5;font-size:13px;margin-bottom:20px}",
      "    .btn{display:inline-flex;align-items:center;justify-content:center;width:100%;padding:14px 18px;border-radius:13px;text-decoration:none;color:#fff;font-weight:800;background:linear-gradient(90deg,#7658ff,#18cfff);box-shadow:0 14px 30px rgba(62,111,255,.2)}",
      "    .small{margin-top:16px;color:#60748c;font-size:11px}",
      "    @keyframes spin{to{transform:rotate(360deg)}}",
      "  </style>",
      "</head>",
      "<body>",
      "  <main class='wrap'>",
      "    <div class='brand'><span class='logo'>C</span><span>canvalives</span></div>",
      "    <section class='card'>",
      "      <p class='eyebrow'>SECURE LINK PREVIEW</p>",
      "      <h1>Continue to your website</h1>",
      "      <p>You are opening a link shared through canvalives. Please wait a moment or continue now.</p>",
      "      <div class='loader' aria-hidden='true'></div>",
      "      <div class='count' id='count'>Continuing in 4 seconds…</div>",
      "      <a class='btn' id='continue' href='" + destination.toString() + "'>Continue →</a>",
      "      <div class='small'>" + shortUrl + "</div>",
      "    </section>",
      "  </main>",
      "  <script>",
      "    (() => {",
      "      const destination = " + safeDestination + ";",
      "      let seconds = 4;",
      "      const count = document.getElementById('count');",
      "      const timer = window.setInterval(() => {",
      "        seconds -= 1;",
      "        if (seconds <= 0) {",
      "          window.clearInterval(timer);",
      "          window.location.replace(destination);",
      "          return;",
      "        }",
      "        count.textContent = 'Continuing in ' + seconds + ' seconds…';",
      "      }, 1000);",
      "    })();",
      "  </script>",
      "</body>",
      "</html>"
    ].join("\n");

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid destination URL." }, { status: 400 });
  }
}

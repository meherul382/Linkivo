import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("linkivo_get_analytics", { p_slug: slug });

  if (error || !data) notFound();

  const link = data.link;
  const countries = data.countries || [];
  const devices = data.devices || [];
  const browsers = data.browsers || [];
  const recent = data.recent || [];

  const card = {background:"#0c1d31",border:"1px solid #203650",borderRadius:18,padding:20};

  return (
    <main style={{minHeight:"100vh",background:"#07111f",color:"#f7fbff",padding:"32px 16px",fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{maxWidth:1050,margin:"0 auto"}}>
        <a href="/" style={{color:"#7ddcff",textDecoration:"none"}}>← Linkivo</a>
        <h1 style={{fontSize:42,margin:"28px 0 8px"}}>Link Analytics</h1>
        <p style={{color:"#8fa3bc",wordBreak:"break-all"}}>{link.destination_url}</p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,margin:"28px 0"}}>
          {[
            ["Total clicks", String(link.clicks)],
            ["Today", String(data.todayClicks)],
            ["Tracked events", String(data.trackedEvents)],
          ].map(([label,value]) => (
            <div key={label} style={card}>
              <div style={{color:"#7f95ad",fontSize:13}}>{label}</div>
              <strong style={{fontSize:30,display:"block",marginTop:8}}>{value}</strong>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {[
            ["Countries", countries],
            ["Devices", devices],
            ["Browsers", browsers],
          ].map(([title,items]) => (
            <section key={String(title)} style={card}>
              <h2 style={{marginTop:0,fontSize:18}}>{title}</h2>
              {Array.isArray(items) && items.length ? items.slice(0,8).map((item: [string,number]) => (
                <div key={item[0]} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #172b43"}}>
                  <span>{item[0]}</span><strong>{item[1]}</strong>
                </div>
              )) : <p style={{color:"#71859e"}}>No clicks yet.</p>}
            </section>
          ))}
        </div>

        <section style={{...card,marginTop:14}}>
          <h2 style={{fontSize:18}}>Recent clicks</h2>
          {recent.map((event: any, index: number) => (
            <div key={index} style={{display:"grid",gridTemplateColumns:"1.2fr .8fr .8fr .8fr",gap:10,padding:"10px 0",borderBottom:"1px solid #172b43",fontSize:13}}>
              <span>{new Date(event.clicked_at).toLocaleString("en-GB",{timeZone:"Asia/Dhaka"})}</span>
              <span>{event.country || "Unknown"}</span>
              <span>{event.device_type || "Unknown"}</span>
              <span>{event.browser || "Unknown"}</span>
            </div>
          ))}
          {!recent.length && <p style={{color:"#71859e"}}>No clicks yet.</p>}
        </section>
      </div>
    </main>
  );
}

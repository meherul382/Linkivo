import { notFound } from "next/navigation";
import { getSupabaseServer } from "../../../lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function AnalyticsDetail(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data, error } = await supabase.rpc("linkivo_get_analytics", { p_slug: slug });
  if (error || !data) notFound();
  const link = data.link;
  const sections: [string, any[]][] = [["Countries", data.countries || []], ["Devices", data.devices || []], ["Browsers", data.browsers || []]];
  return <main style={{minHeight:"100vh",background:"#080e1a",color:"#f5f7ff",padding:"30px 16px",fontFamily:"Inter,system-ui,sans-serif"}}><div style={{maxWidth:1000,margin:"auto"}}>
    <a href="/analytics" style={{color:"#67e8f9"}}>← Analytics</a><p style={{color:"#70dce9",letterSpacing:".15em",fontSize:10,fontWeight:800,marginTop:35}}>LINK PERFORMANCE</p><h1>Click details</h1><p style={{color:"#97a6ba",overflowWrap:"anywhere"}}>{link.destination_url}</p><p style={{color:"#67e8f9"}}>{slug}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,margin:"26px 0"}}>{[["Total clicks",link.clicks],["Today",data.todayClicks],["Events tracked",data.trackedEvents]].map(([n,v])=><section key={String(n)} style={{padding:20,border:"1px solid #25344a",borderRadius:15,background:"#101b2b"}}><small style={{color:"#8393a9"}}>{n}</small><h2 style={{fontSize:30,margin:"10px 0 0"}}>{v}</h2></section>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>{sections.map(([title,items])=><section key={title} style={{padding:20,border:"1px solid #25344a",borderRadius:15,background:"#101b2b"}}><h2 style={{fontSize:16,marginTop:0}}>{title}</h2>{items.length?items.map((i:any,index:number)=><div key={index} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1d293b",fontSize:12}}><span>{i[0]||"Unknown"}</span><b>{i[1]}</b></div>):<p style={{color:"#718096",fontSize:12}}>No data yet.</p>}</section>)}</div>
    <section style={{padding:20,border:"1px solid #25344a",borderRadius:15,background:"#101b2b",marginTop:12}}><h2 style={{fontSize:16}}>Recent visits</h2>{(data.recent||[]).length?(data.recent||[]).map((e:any,i:number)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.2fr .7fr .7fr .7fr",gap:10,padding:"10px 0",borderBottom:"1px solid #1d293b",fontSize:12}}><span>{new Date(e.clicked_at).toLocaleString("en-GB",{timeZone:"Asia/Dhaka"})}</span><span>{e.country||"Unknown"}</span><span>{e.device_type||"Unknown"}</span><span>{e.browser||"Unknown"}</span></div>):<p style={{color:"#718096",fontSize:12}}>No tracked clicks yet.</p>}</section>
  </div></main>;
}
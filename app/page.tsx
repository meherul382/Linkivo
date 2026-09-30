"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabase/browser";

type SavedLink = {
  slug: string; shortUrl: string; destinationUrl: string; createdAt: string; clicks: number;
};

const DOMAINS = ["canvalives.com", "canvatr.com"];

export default function Home() {
  const [url,setUrl]=useState("");
  const [alias,setAlias]=useState("");
  const [domain,setDomain]=useState("canvalives.com");
  const [created,setCreated]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [myLinks,setMyLinks]=useState<SavedLink[]>([]);
  const [profileOpen,setProfileOpen]=useState(false);

  async function logout(){ await getSupabaseBrowser().auth.signOut(); window.location.href="/login"; }

  async function loadLinks(){
    try{const r=await fetch("/api/links",{cache:"no-store"});const d=await r.json();if(r.ok&&Array.isArray(d.links))setMyLinks(d.links);}
    catch{}
  }
  useEffect(()=>{loadLinks();},[]);

  async function removeLink(slug:string){
    const r=await fetch("/api/links/"+encodeURIComponent(slug),{method:"DELETE"});
    if(r.ok)setMyLinks(prev=>prev.filter(x=>x.slug!==slug));
  }
  async function copyLink(shortUrl:string){try{await navigator.clipboard.writeText(shortUrl);}catch{}}

  async function createLink(e:React.FormEvent){
    e.preventDefault();setError("");setCreated("");setLoading(true);
    try{
      const r=await fetch("/api/links",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,alias,domain})});
      const d=await r.json();
      if(!r.ok){setError(d.error||"Could not create the short link.");return;}
      setCreated(d.shortUrl);
      setMyLinks(prev=>[{slug:d.slug,shortUrl:d.shortUrl,destinationUrl:d.destinationUrl,createdAt:d.createdAt||new Date().toISOString(),clicks:0},...prev.filter(x=>x.slug!==d.slug)]);
      setUrl("");setAlias("");
    }catch{setError("Network error. Please try again.");}
    finally{setLoading(false);}
  }

  return <main className="page">
    <section className="hero container">
      <div className="nav">
        <div className="brand"><span className="logo">C</span><span>canvalives</span></div>
        <div className="top-nav">
          <a className="nav-card active" href="/">⌂ <span>Home</span></a>
          <a className="nav-card" href="/links">↗ <span>My Links</span></a>
          <a className="nav-card" href="/analytics">◉ <span>Analytics</span></a>
        </div>
        <div className="profile-wrap">
          <button className="profile-btn" type="button" onClick={()=>setProfileOpen(v=>!v)}>
            <span className="avatar">A</span><span>Profile</span><span className="chevron">{profileOpen?"⌃":"⌄"}</span>
          </button>
          {profileOpen && <div className="profile-menu">
            <div className="profile-head"><span className="avatar big">A</span><div><strong>admin</strong><small>Private account</small></div></div>
            <div className="profile-divider"></div>
            <div className="profile-label">Personal URL Shortener</div>
            <button className="menu-logout" type="button" onClick={logout}>↪ Logout</button>
          </div>}
        </div>
      </div>

      <div className="hero-grid">
        <div>
          <p className="eyebrow">FAST · PRIVATE · SIMPLE</p>
          <h1>Your links.<br/><span>Shorter.</span> Smarter.</h1>
          <p className="lead">Create clean short links and manage your personal links from one premium dashboard.</p>
          <div className="stats"><div><strong>01</strong><small>Personal workspace</small></div><div><strong>∞</strong><small>Links ready to grow</small></div><div><strong>24/7</strong><small>Redirect availability</small></div></div>
        </div>

        <div className="card">
          <div className="card-head"><div><h2>Create short link</h2><p>Choose a domain and paste your destination URL.</p></div><span className="dot"></span></div>
          <form onSubmit={createLink}>
            <label>Destination URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/your-long-url" required /></label>
            <label>Short domain
              <select value={domain} onChange={e=>setDomain(e.target.value)}>
                {DOMAINS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>Custom alias <em>optional</em>
              <div className="alias"><span>{domain}/</span><input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="my-link" /></div>
            </label>
            <button className="primary" type="submit" disabled={loading}>{loading?"Creating...":"Create Link"} <span>↗</span></button>
          </form>
          {error&&<div className="error">{error}</div>}
          {created&&<div className="result"><small>Short link created</small><div><strong>{created}</strong><button type="button" onClick={()=>copyLink(created)}>Copy</button></div><a className="analytics" href={`/analytics/${created.split("/").pop()}`}>View Analytics →</a></div>}
        </div>
      </div>
    </section>

    <section className="my-links container">
      <div className="my-links-head"><div><p className="eyebrow">LINK LIBRARY</p><h2>My Links</h2><p>Saved securely in your canvalives account — not your browser.</p></div><span className="count">{myLinks.length} links</span></div>
      {myLinks.length===0?<div className="empty-links"><div className="empty-icon">↗</div><strong>No links yet</strong><span>Create your first short link above and it will stay saved even if browser history is cleared.</span></div>:
      <div className="links-list">{myLinks.map(link=><div className="link-row" key={link.slug}><div className="link-main"><a href={link.shortUrl} className="short-link">{link.shortUrl}</a><div className="destination">{link.destinationUrl}</div><small>{new Date(link.createdAt).toLocaleString()} · {link.clicks} clicks</small></div><div className="link-actions"><button type="button" onClick={()=>copyLink(link.shortUrl)}>Copy</button><a href={"/analytics/"+link.slug}>Analytics</a><button type="button" className="danger" onClick={()=>removeLink(link.slug)}>Delete</button></div></div>)}</div>}
    </section>

    <section className="features container"><div><span>01</span><h3>Simple dashboard</h3><p>Keep every personal short link in one place.</p></div><div><span>02</span><h3>Real analytics</h3><p>Track clicks, devices, countries, browsers and timing.</p></div><div><span>03</span><h3>Fast redirects</h3><p>Each short URL resolves through canvalives and records the click.</p></div></section>

    <style jsx>{`
      .page{min-height:100vh;background:radial-gradient(circle at 80% 10%,rgba(80,112,255,.18),transparent 32%),radial-gradient(circle at 10% 30%,rgba(0,219,255,.09),transparent 25%),#07111f}
      .hero{padding:28px 0 70px}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:80px;position:relative}.brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800}.top-nav{display:flex;align-items:center;gap:8px;margin-left:auto;margin-right:18px}.nav-card{display:flex;align-items:center;gap:7px;padding:9px 13px;border:1px solid rgba(255,255,255,.09);border-radius:12px;color:#9fb0c7;text-decoration:none;font-size:12px;background:rgba(255,255,255,.025);transition:.2s}.nav-card:hover,.nav-card.active{color:#fff;border-color:rgba(57,217,255,.35);background:rgba(57,217,255,.08)}.nav-card span{font-weight:600}.logo{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#7c5cff,#1fd6ff);box-shadow:0 10px 30px rgba(76,108,255,.25)}
      .profile-wrap{position:relative}.profile-btn{display:flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.035);color:#dce8f5;font-size:12px;cursor:pointer}.profile-btn:hover{border-color:rgba(57,217,255,.35);background:rgba(57,217,255,.08)}.avatar{display:grid;place-items:center;width:25px;height:25px;border-radius:8px;background:linear-gradient(135deg,#7c5cff,#1fd6ff);font-size:11px;font-weight:900;color:#fff}.avatar.big{width:34px;height:34px;border-radius:10px}.chevron{color:#71869e}.profile-menu{position:absolute;right:0;top:46px;width:235px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:#0b1b2e;box-shadow:0 25px 60px rgba(0,0,0,.35);z-index:50}.profile-head{display:flex;align-items:center;gap:10px;padding:5px 4px 10px}.profile-head strong{display:block;font-size:13px}.profile-head small{display:block;color:#70849b;font-size:11px;margin-top:3px}.profile-divider{height:1px;background:#1b3048;margin:2px 0 10px}.profile-label{padding:8px 8px;color:#71859d;font-size:11px}.menu-logout{width:100%;padding:10px;border:1px solid #4a2732;border-radius:10px;background:#281722;color:#ffadbb;text-align:left;font-size:12px;cursor:pointer}.menu-logout:hover{background:#341d29}
      .hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}.eyebrow{letter-spacing:.18em;color:#75cfff;font-size:11px;font-weight:700}h1{font-size:clamp(48px,7vw,82px);line-height:.98;margin:18px 0}.lead{max-width:600px;color:#9fb0c7;font-size:18px;line-height:1.7}.hero h1 span{background:linear-gradient(90deg,#8e6cff,#39d9ff);-webkit-background-clip:text;background-clip:text;color:transparent}.stats{display:flex;gap:34px;margin-top:42px}.stats div{display:flex;flex-direction:column;gap:4px}.stats strong{font-size:22px}.stats small{color:#74879f}
      .card{background:rgba(10,24,43,.82);border:1px solid rgba(255,255,255,.11);border-radius:28px;padding:30px;box-shadow:0 30px 90px rgba(0,0,0,.25);backdrop-filter:blur(16px)}.card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.card h2{margin:0;font-size:22px}.card p{margin:7px 0 0;color:#879ab2;font-size:13px}.dot{width:10px;height:10px;border-radius:50%;background:#39d9ff;box-shadow:0 0 20px #39d9ff}label{display:block;color:#dbe6f2;font-size:13px;margin:16px 0}.card em{color:#6f8199;font-style:normal;float:right}input,select{box-sizing:border-box;width:100%;margin-top:8px;padding:15px 16px;border:1px solid #233957;background:#091728;color:#fff;border-radius:13px;outline:none}select{appearance:none;cursor:pointer} .alias{display:flex;align-items:center;margin-top:8px;background:#091728;border:1px solid #233957;border-radius:13px;overflow:hidden}.alias span{padding-left:14px;color:#6f829c;font-size:13px;white-space:nowrap}.alias input{margin:0;border:0}.primary{width:100%;margin-top:14px;padding:15px 18px;border:0;border-radius:13px;color:#fff;font-weight:800;background:linear-gradient(90deg,#7658ff,#18cfff);cursor:pointer}.primary span{float:right}.primary:disabled{opacity:.65;cursor:wait}.error{margin-top:16px;padding:12px 14px;border-radius:12px;background:#3a1821;border:1px solid #703043;color:#ffb5c2;font-size:13px}.result{margin-top:18px;padding:14px;border-radius:14px;background:#0c2237;border:1px solid rgba(57,217,255,.2)}.result small{color:#7f95ad}.result div{display:flex;gap:10px;align-items:center;margin-top:7px}.result strong{font-size:13px;word-break:break-all;flex:1}.result button{border:0;background:#1a3550;color:#fff;padding:8px 11px;border-radius:9px;cursor:pointer}.analytics{display:inline-block;margin-top:12px;color:#6ee2ff;font-size:12px}
      .my-links{padding:10px 0 70px}.my-links-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:18px}.my-links-head h2{font-size:32px;margin:6px 0}.my-links-head>div>p:last-child{color:#8194ab;margin:0}.count{padding:8px 12px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:#8ea2ba;font-size:12px}.empty-links{padding:38px;text-align:center;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:rgba(255,255,255,.025);display:flex;flex-direction:column;align-items:center;gap:8px}.empty-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(57,217,255,.1);color:#6ee2ff;font-size:20px}.empty-links span{color:#71849b;font-size:13px}.links-list{display:grid;gap:12px}.link-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 20px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(10,24,43,.68)}.link-main{min-width:0}.short-link{color:#6ee2ff;font-weight:800;text-decoration:none;font-size:14px}.destination{color:#a1b1c5;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:650px;margin-top:6px}.link-main small{display:block;color:#61758e;font-size:11px;margin-top:7px}.link-actions{display:flex;gap:8px;flex-shrink:0}.link-actions button,.link-actions a{border:1px solid #263d58;background:#122941;color:#dce8f5;padding:8px 11px;border-radius:9px;font-size:12px;text-decoration:none;cursor:pointer}.link-actions .danger{color:#ff9faf;border-color:#4a2732;background:#281722}.features{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:70px}.features>div{padding:24px;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:rgba(255,255,255,.025)}.features span{color:#5edcff;font-size:12px}.features h3{margin:12px 0 7px}.features p{color:#8194ab;line-height:1.6;font-size:14px}
      @media(max-width:820px){.hero-grid,.features{grid-template-columns:1fr}.nav{margin-bottom:55px;flex-wrap:wrap;gap:14px}.top-nav{order:3;width:100%;margin:0}.nav-card{flex:1;justify-content:center}.stats{gap:18px;flex-wrap:wrap}.my-links-head{align-items:flex-start;gap:15px}.link-row{align-items:flex-start;flex-direction:column}.link-actions{width:100%;flex-wrap:wrap}.link-actions button,.link-actions a{flex:1;text-align:center}.destination{max-width:100%}.profile-wrap{margin-left:auto}}
    `}</style>
  </main>;
}
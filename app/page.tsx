"use client";

import { useEffect, useState } from "react";

type SavedLink = { slug:string; shortUrl:string; destinationUrl:string; createdAt:string; clicks:number };

export default function Home() {
  const [url,setUrl]=useState("");
  const [alias,setAlias]=useState("");
  const [created,setCreated]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [links,setLinks]=useState<SavedLink[]>([]);
  const [copied,setCopied]=useState("");
  const [profileOpen,setProfileOpen]=useState(false);

  async function loadLinks(){
    try { const r=await fetch("/api/links",{cache:"no-store"}); const d=await r.json(); if(r.ok&&Array.isArray(d.links))setLinks(d.links); }
    catch {}
  }
  useEffect(()=>{loadLinks();},[]);
  async function logout(){ await fetch("/api/session/logout",{method:"POST"}); window.location.href="/login"; }
  async function copy(value:string){
    try { await navigator.clipboard.writeText(value); setCopied(value); window.setTimeout(()=>setCopied(""),1600); } catch {}
  }
  async function remove(slug:string){
    if(!window.confirm("Archive this short link?"))return;
    const r=await fetch("/api/links/"+encodeURIComponent(slug),{method:"DELETE"});
    if(r.ok)setLinks(x=>x.filter(l=>l.slug!==slug));
  }
  async function create(e:React.FormEvent){
    e.preventDefault();setError("");setCreated("");setLoading(true);
    try{
      const r=await fetch("/api/links",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,alias})});
      const d=await r.json();
      if(!r.ok){setError(d.error||"Unable to create link.");return;}
      setCreated(d.shortUrl);setUrl("");setAlias("");await loadLinks();
    }catch{setError("Network error. Please try again.");}
    finally{setLoading(false);}
  }

  return <main className="page">
    <header className="top container">
      <a className="brand" href="/"><span className="logo">L</span><span>Linkivo</span><small>PERSONAL</small></a>
      <nav><a className="active" href="/">Overview</a><a href="/links">My Links</a><a href="/analytics">Analytics</a></nav>
      <div className="profile">
        <button className="profileBtn" onClick={()=>setProfileOpen(v=>!v)}><span className="avatar">P</span><span>Private workspace</span><span>⌄</span></button>
        {profileOpen&&<div className="menu"><p>Personal account</p><button onClick={logout}>Sign out ↗</button></div>}
      </div>
    </header>

    <section className="hero container">
      <div className="heroCopy"><div className="eyebrow"><span className="pulse"/> PRIVATE LINK WORKSPACE</div><h1>Less URL.<br/><span>More control.</span></h1>
        <p>One private place for your links. Shorten, organize, edit destinations, and review clicks without a public account system.</p>
        <div className="heroMeta"><div><strong>01</strong><span>Private workspace</span></div><div><strong>302</strong><span>Fast redirects</span></div><div><strong>24/7</strong><span>Link access</span></div></div>
      </div>
      <section className="create card">
        <div className="cardTitle"><div><span className="step">CREATE A LINK</span><h2>Shorten a URL</h2><p>Paste your destination. Keep the alias memorable.</p></div><span className="spark">↗</span></div>
        <form onSubmit={create}>
          <label>Destination URL<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/a/very/long/link"/></label>
          <label>Custom alias <span className="optional">OPTIONAL</span><div className="alias"><span>/</span><input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="my-link"/></div><small className="help">3–40 letters, numbers, hyphens, or underscores.</small></label>
          <button className="primary" disabled={loading}>{loading?"Creating link…":"Create short link"} <span>→</span></button>
        </form>
        {error&&<div className="error">{error}</div>}
        {created&&<div className="success"><div><small>YOUR SHORT LINK</small><strong>{created}</strong></div><button onClick={()=>copy(created)}>{copied===created?"Copied ✓":"Copy link"}</button></div>}
      </section>
    </section>

    <section className="workspace container">
      <div className="sectionHead"><div><span className="step">YOUR LIBRARY</span><h2>Recent links</h2><p>Only links saved to your private account appear here.</p></div><a className="viewAll" href="/links">Manage links <span>→</span></a></div>
      {links.length===0?<div className="empty card"><span className="emptyIcon">↗</span><strong>Your link library is empty</strong><p>Create your first short link above to get started.</p></div>:
      <div className="linkList">{links.slice(0,5).map(l=><article className="linkRow card" key={l.slug}><div className="linkIcon">↗</div><div className="linkInfo"><a className="short" href={l.shortUrl}>{l.shortUrl}</a><p>{l.destinationUrl}</p><small>Created {new Date(l.createdAt).toLocaleString()} · {l.clicks} clicks</small></div><div className="actions"><button onClick={()=>copy(l.shortUrl)}>{copied===l.shortUrl?"Copied ✓":"Copy"}</button><a href={"/analytics/"+l.slug}>Stats</a><button className="delete" onClick={()=>remove(l.slug)}>Archive</button></div></article>)}</div>}
    </section>
    <footer className="footer container"><span><span className="logo tiny">L</span> Linkivo</span><span>Private by design · Personal use</span></footer>
    <style jsx>{`
      .page{min-height:100vh;background:radial-gradient(ellipse at 75% 0%,rgba(79,70,229,.15),transparent 36%),radial-gradient(ellipse at 4% 36%,rgba(6,182,212,.07),transparent 30%),#080e1a;color:#f5f7ff}
      .container{width:min(1160px,calc(100% - 40px));margin:0 auto}.top{height:92px;display:flex;align-items:center;gap:35px;border-bottom:1px solid #1d293b}
      .brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800;white-space:nowrap}.brand small{font-size:9px;letter-spacing:.12em;color:#7b8ba4;border:1px solid #29384d;padding:4px 6px;border-radius:5px}
      .logo{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);box-shadow:0 8px 25px #4f46e533}.logo.tiny{display:inline-grid;width:21px;height:21px;border-radius:7px;font-size:11px}
      nav{display:flex;gap:5px;margin-left:auto}nav a{padding:10px 13px;border-radius:10px;color:#8190a7;font-size:13px}nav a.active,nav a:hover{color:#fff;background:#172337}
      .profile{position:relative}.profileBtn{display:flex;align-items:center;gap:9px;padding:8px 10px;background:#111b2a;border:1px solid #253248;border-radius:12px;color:#c4cede;font-size:12px;white-space:nowrap;cursor:pointer}.avatar{width:25px;height:25px;display:grid;place-items:center;background:#293456;border-radius:8px;color:#c4b5fd;font-weight:800}
      .menu{position:absolute;right:0;top:48px;z-index:20;width:190px;padding:12px;background:#101b2b;border:1px solid #29384d;border-radius:12px;box-shadow:0 20px 50px #0008}.menu p{margin:5px 5px 12px;color:#8c9cb3;font-size:12px}.menu button{width:100%;text-align:left;border:0;border-radius:8px;padding:10px;background:#261a2a;color:#ffb4c0;cursor:pointer}
      .hero{display:grid;grid-template-columns:1fr .86fr;gap:72px;align-items:center;padding-top:76px;padding-bottom:82px}.heroCopy{padding:12px 0}.eyebrow,.step{font-size:10px;font-weight:800;letter-spacing:.17em;color:#70dce9}.eyebrow{display:flex;align-items:center;gap:9px}.pulse{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 5px #34d3991c}
      h1{font-size:clamp(52px,6vw,76px);letter-spacing:-.055em;line-height:1.02;margin:23px 0 20px}h1 span{background:linear-gradient(95deg,#a78bfa,#22d3ee);color:transparent;background-clip:text}.heroCopy>p{max-width:535px;color:#98a7bd;line-height:1.8;font-size:16px}.heroMeta{display:flex;gap:34px;margin-top:42px}.heroMeta div{display:flex;flex-direction:column;gap:6px}.heroMeta strong{font-size:21px}.heroMeta span{font-size:11px;color:#77879e}
      .card{background:linear-gradient(145deg,#111d2e,#0d1725);border:1px solid #25344a;border-radius:20px;box-shadow:0 20px 60px #0002}.create{padding:29px}.cardTitle{display:flex;justify-content:space-between;gap:16px;margin-bottom:23px}.cardTitle h2{margin:9px 0 7px;font-size:23px;letter-spacing:-.02em}.cardTitle p{font-size:12px;color:#8191a8;margin:0;line-height:1.6}.spark{width:39px;height:39px;display:grid;place-items:center;background:#222342;color:#c4b5fd;border-radius:12px;font-size:19px}
      label{display:block;margin:17px 0;color:#cbd5e1;font-size:12px;font-weight:650}input{display:block;width:100%;box-sizing:border-box;margin-top:9px;padding:14px 13px;border:1px solid #2b3b51;background:#091321;color:#f6f8ff;border-radius:10px;outline:none;font-size:13px}input:focus{border-color:#818cf8;box-shadow:0 0 0 3px #818cf81c}input::placeholder{color:#52647b}.optional{float:right;font-size:9px;letter-spacing:.1em;color:#74859d;font-weight:500}.alias{display:flex;align-items:center;margin-top:9px;background:#091321;border:1px solid #2b3b51;border-radius:10px}.alias span{padding-left:14px;color:#71829a}.alias input{border:0;margin:0;background:transparent}.help{display:block;color:#66788f;font-size:10px;margin-top:7px;font-weight:400}
      .primary{display:flex;align-items:center;justify-content:space-between;width:100%;border:0;border-radius:10px;padding:14px 16px;margin-top:21px;background:linear-gradient(95deg,#7c3aed,#0891b2);color:#fff;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 10px 25px #4f46e52b}.primary:disabled{opacity:.6}.error{padding:11px 12px;margin-top:14px;border:1px solid #70364a;border-radius:10px;background:#351b2a;color:#ffbcc8;font-size:12px}.success{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:15px;padding:13px;background:#102b2b;border:1px solid #24574d;border-radius:12px}.success div{min-width:0}.success small{display:block;color:#7dd3c7;font-size:9px;letter-spacing:.12em;margin-bottom:5px}.success strong{display:block;word-break:break-all;font-size:12px;color:#d9fffa}.success button{padding:9px 11px;border:1px solid #28645a;border-radius:8px;background:#16443e;color:#a7f3d0;white-space:nowrap;cursor:pointer}
      .workspace{padding-bottom:75px}.sectionHead{display:flex;align-items:end;justify-content:space-between;margin-bottom:20px}.sectionHead h2{margin:9px 0 7px;font-size:28px;letter-spacing:-.03em}.sectionHead p{color:#7f90a8;font-size:12px;margin:0}.viewAll{font-size:12px;color:#9fa8ff;padding:10px 12px;border:1px solid #2b3152;border-radius:10px}.viewAll span{margin-left:12px}.empty{padding:38px;text-align:center}.emptyIcon{width:39px;height:39px;display:grid;place-items:center;margin:0 auto 14px;border-radius:12px;background:#202d44;color:#94a3b8;font-size:20px}.empty strong{display:block;font-size:14px}.empty p{color:#7889a1;font-size:12px;margin:8px 0 0}.linkList{display:grid;gap:10px}.linkRow{display:flex;align-items:center;gap:14px;padding:16px 18px}.linkIcon{width:38px;height:38px;flex:0 0 auto;display:grid;place-items:center;border-radius:11px;background:#1a2a3e;color:#67e8f9}.linkInfo{flex:1;min-width:0}.short{font-size:13px;font-weight:750;color:#67e8f9}.linkInfo p{font-size:12px;color:#9aa8bc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:6px 0}.linkInfo small{font-size:10px;color:#6d7f96}.actions{display:flex;gap:7px}.actions button,.actions a{padding:8px 10px;border:1px solid #2a3b53;border-radius:8px;background:#172538;color:#bdc9d9;font-size:11px;cursor:pointer}.actions .delete{color:#fda4af;background:#281b29;border-color:#4e2d40}.footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1d293b;padding:23px 0 32px;color:#77879d;font-size:11px}.footer>span:first-child{display:flex;align-items:center;gap:7px;color:#c4cede;font-weight:750}
      @media(max-width:850px){.top{gap:15px}.hero{grid-template-columns:1fr;gap:35px;padding-top:48px;padding-bottom:55px}.heroCopy{padding:0}.create{max-width:620px;width:100%;justify-self:center}nav a{padding:9px;font-size:12px}}
      @media(max-width:600px){.container{width:calc(100% - 28px)}.top{height:auto;padding:16px 0;flex-wrap:wrap}.brand{font-size:18px}.profile{margin-left:auto}.profileBtn>span:nth-child(2){display:none}nav{order:3;flex-basis:100%;margin:0;display:grid;grid-template-columns:repeat(3,1fr)}nav a{text-align:center}.hero{padding-top:39px}h1{font-size:52px}.heroCopy>p{font-size:14px}.heroMeta{gap:18px}.heroMeta span{font-size:10px}.create{padding:20px}.sectionHead h2{font-size:24px}.linkRow{align-items:flex-start;flex-wrap:wrap}.linkInfo{width:calc(100% - 55px);flex:none}.actions{width:100%;padding-left:51px;flex-wrap:wrap}.actions button,.actions a{flex:1;text-align:center}.footer{gap:14px;align-items:flex-start}}
    `}</style>
  </main>;
}

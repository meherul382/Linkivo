"use client";

import { useEffect, useState } from "react";

type SavedLink={slug:string;shortUrl:string;destinationUrl:string;createdAt:string;clicks:number;domain?:string};

export default function MyLinksPage() {
  const [links,setLinks]=useState<SavedLink[]>([]);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState<SavedLink|null>(null);
  const [editUrl,setEditUrl]=useState("");
  const [editError,setEditError]=useState("");
  const [saving,setSaving]=useState(false);
  const [copied,setCopied]=useState("");

  async function load(){
    try{
      const r=await fetch("/api/links",{cache:"no-store"});
      const d=await r.json();
      if(r.ok && Array.isArray(d.links)) setLinks(d.links);
    }finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function copy(url:string){
    try{
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(()=>setCopied(""),1800);
    }catch{}
  }

  function openEdit(link:SavedLink){setEditing(link);setEditUrl(link.destinationUrl);setEditError("");}

  async function saveEdit(e:React.FormEvent){
    e.preventDefault();
    if(!editing)return;
    setEditError("");setSaving(true);
    try{
      const r=await fetch("/api/links/"+encodeURIComponent(editing.slug),{
        method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({destinationUrl:editUrl})
      });
      const d=await r.json();
      if(!r.ok){setEditError(d.error||"Could not update the destination URL.");return;}
      setLinks(prev=>prev.map(x=>x.slug===editing.slug?{...x,destinationUrl:d.destinationUrl}:x));
      setEditing(null);
    }catch{setEditError("Network error. Please try again.");}
    finally{setSaving(false);}
  }

  async function remove(slug:string){
    const r=await fetch("/api/links/"+encodeURIComponent(slug),{method:"DELETE"});
    if(r.ok) setLinks(prev=>prev.filter(x=>x.slug!==slug));
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <a className="brand" href="/"><span className="logo">C</span><span>canvalives</span></a>
          <nav><a href="/">⌂ Home</a><a className="active" href="/links">↗ My Links</a><a href="/analytics">◉ Analytics</a></nav>
        </header>

        <section className="title">
          <p>LINK LIBRARY</p><h1>My Links</h1>
          <span>Saved securely in your canvalives account — independent of browser history.</span>
          <b>{links.length} links</b>
        </section>

        {loading ? <div className="empty">Loading saved links...</div> :
        !links.length ? <div className="empty">No links yet. <a href="/">Create your first short link →</a></div> :
        <div className="list">{links.map(link=>(
          <article className="row" key={link.slug}>
            <div className="main">
              <a className="short" href={link.shortUrl}>{link.shortUrl}</a>
              <div className="dest">{link.destinationUrl}</div>
              <small>{new Date(link.createdAt).toLocaleString()} · {link.clicks} clicks</small>
            </div>
            <div className="actions">
              <button type="button" className={copied===link.shortUrl?"copied":""} onClick={()=>copy(link.shortUrl)}>{copied===link.shortUrl?"✓ Copied!":"Copy"}</button>
              <a href={"/analytics/"+link.slug}>Analytics</a>
              <button type="button" className="edit" onClick={()=>openEdit(link)}>✎ Edit</button>
              <button className="delete" onClick={()=>remove(link.slug)}>Delete</button>
            </div>
          </article>
        ))}</div>}

        {editing && <div className="overlay" onClick={()=>!saving&&setEditing(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-top"><div><p>EDIT SHORT LINK</p><h2>Change destination</h2></div><button className="close" type="button" onClick={()=>setEditing(null)} disabled={saving}>×</button></div>
            <div className="fixed-link">{editing.shortUrl}</div>
            <p className="hint">Short link stays exactly the same. Only the destination website will change.</p>
            <form onSubmit={saveEdit}>
              <label>New destination URL<input value={editUrl} onChange={e=>setEditUrl(e.target.value)} placeholder="https://example.com/new-page" required /></label>
              {editError&&<div className="error">{editError}</div>}
              <div className="modal-actions"><button type="button" className="cancel" onClick={()=>setEditing(null)} disabled={saving}>Cancel</button><button type="submit" className="save" disabled={saving}>{saving?"Saving...":"Save Changes →"}</button></div>
            </form>
          </div>
        </div>}

        <style jsx>{`
          .page{min-height:100vh;background:#07111f;color:#f7fbff;font-family:Inter,system-ui,sans-serif}.container{max-width:1120px;margin:auto;padding:0 20px}
          .header{height:86px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-size:20px;font-weight:800}.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7c5cff,#1fd6ff)}
          nav{display:flex;gap:8px}nav a{padding:10px 14px;border-radius:12px;color:#93a6bd;text-decoration:none;font-size:13px}nav a:hover,nav .active{background:rgba(57,217,255,.08);color:#fff}
          .title{padding:55px 0 25px;position:relative}.title p{color:#75cfff;letter-spacing:.18em;font-size:11px;font-weight:700}.title h1{font-size:48px;margin:10px 0}.title span{color:#8194ab}.title b{position:absolute;right:0;bottom:28px;padding:9px 13px;border:1px solid #263b55;border-radius:999px;color:#9eb0c5;font-size:12px}
          .list{display:grid;gap:12px;padding-bottom:70px}.row{display:flex;justify-content:space-between;gap:20px;padding:20px;border:1px solid #203650;border-radius:18px;background:#0c1d31}.short{color:#6ee2ff;font-weight:800;text-decoration:none}.dest{color:#a1b1c5;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:700px;margin:8px 0}.main small{color:#61758e;font-size:11px}.actions{display:flex;gap:8px;align-items:center}.actions button,.actions a{padding:9px 12px;border:1px solid #29415e;border-radius:10px;background:#122941;color:#dce8f5;text-decoration:none;font-size:12px;cursor:pointer}.actions .copied{color:#79ffd9;border-color:#28665a;background:#123a36}.actions .edit{color:#8fe8ff;border-color:#24516a;background:#102c40}.actions .delete{color:#ff9faf;background:#281722;border-color:#4a2732}.overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(2,8,16,.72);backdrop-filter:blur(8px)}.modal{width:min(520px,100%);padding:26px;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:#0b1b2e;box-shadow:0 35px 100px rgba(0,0,0,.5)}.modal-top{display:flex;justify-content:space-between;align-items:flex-start}.modal-top p{margin:0;color:#75cfff;font-size:10px;letter-spacing:.18em;font-weight:800}.modal h2{margin:8px 0 0;font-size:24px}.close{width:34px;height:34px;border:1px solid #29415e;border-radius:10px;background:#122941;color:#b8c7d8;font-size:22px;cursor:pointer}.fixed-link{margin-top:22px;padding:12px 14px;border-radius:11px;background:#091728;border:1px solid #203650;color:#6ee2ff;font-weight:800;word-break:break-all}.hint{color:#7e91a9;font-size:12px;line-height:1.6}.modal label{display:block;color:#dce8f5;font-size:13px;margin-top:18px}.modal input{box-sizing:border-box;width:100%;margin-top:8px;padding:14px;border:1px solid #29415e;border-radius:12px;background:#091728;color:#fff;outline:none}.modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.cancel,.save{padding:11px 15px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer}.cancel{border:1px solid #29415e;background:#122941;color:#cbd8e6}.save{border:0;background:linear-gradient(90deg,#7658ff,#18cfff);color:#fff}.error{margin-top:12px;padding:10px 12px;border:1px solid #703043;background:#3a1821;border-radius:10px;color:#ffb5c2;font-size:12px}.empty{padding:50px;text-align:center;border:1px solid #203650;border-radius:18px;color:#8093aa}.empty a{color:#6ee2ff;text-decoration:none}
          @media(max-width:700px){.header{height:auto;padding:18px 0;gap:15px;flex-direction:column;align-items:stretch}nav{width:100%}nav a{flex:1;text-align:center}.row{flex-direction:column}.actions{width:100%;flex-wrap:wrap}.actions button,.actions a{flex:1;text-align:center}.dest{max-width:100%}.title h1{font-size:38px}.title b{position:static;display:inline-block;margin-top:18px}}
        `}</style>
      </div>
    </main>
  );
}
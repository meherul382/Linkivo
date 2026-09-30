"use client";

import { useEffect, useState } from "react";

type SavedLink = {
  slug: string;
  shortUrl: string;
  destinationUrl: string;
  createdAt: string;
};

export default function MyLinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("canvalives_my_links") || "[]");
      if (Array.isArray(saved)) setLinks(saved);
    } catch {}
  }, []);

  async function copy(url: string) {
    try { await navigator.clipboard.writeText(url); } catch {}
  }

  function remove(slug: string) {
    const next = links.filter(x => x.slug !== slug);
    setLinks(next);
    localStorage.setItem("canvalives_my_links", JSON.stringify(next));
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <a className="brand" href="/"><span className="logo">C</span><span>canvalives</span></a>
          <nav>
            <a href="/">⌂ Home</a><a className="active" href="/links">↗ My Links</a><a href="/analytics">◉ Analytics</a>
          </nav>
        </header>

        <section className="title">
          <p>LINK LIBRARY</p><h1>My Links</h1>
          <span>Every short link created from this browser is kept here.</span>
          <b>{links.length} links</b>
        </section>

        {!links.length ? <div className="empty">No links yet. <a href="/">Create your first short link →</a></div> :
        <div className="list">{links.map(link => (
          <article className="row" key={link.slug}>
            <div className="main">
              <a className="short" href={link.shortUrl}>{link.shortUrl}</a>
              <div className="dest">{link.destinationUrl}</div>
              <small>{new Date(link.createdAt).toLocaleString()}</small>
            </div>
            <div className="actions">
              <button onClick={() => copy(link.shortUrl)}>Copy</button>
              <a href={"/analytics/" + link.slug}>Analytics</a>
              <button className="delete" onClick={() => remove(link.slug)}>Delete</button>
            </div>
          </article>
        ))}</div>}

        <style jsx>{`
          .page{min-height:100vh;background:#07111f;color:#f7fbff;font-family:Inter,system-ui,sans-serif}.container{max-width:1120px;margin:auto;padding:0 20px}
          .header{height:86px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-size:20px;font-weight:800}.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7c5cff,#1fd6ff)}
          nav{display:flex;gap:8px}nav a{padding:10px 14px;border-radius:12px;color:#93a6bd;text-decoration:none;font-size:13px}nav a:hover,nav .active{background:rgba(57,217,255,.08);color:#fff}
          .title{padding:55px 0 25px;position:relative}.title p{color:#75cfff;letter-spacing:.18em;font-size:11px;font-weight:700}.title h1{font-size:48px;margin:10px 0}.title span{color:#8194ab}.title b{position:absolute;right:0;bottom:28px;padding:9px 13px;border:1px solid #263b55;border-radius:999px;color:#9eb0c5;font-size:12px}
          .list{display:grid;gap:12px;padding-bottom:70px}.row{display:flex;justify-content:space-between;gap:20px;padding:20px;border:1px solid #203650;border-radius:18px;background:#0c1d31}.short{color:#6ee2ff;font-weight:800;text-decoration:none}.dest{color:#a1b1c5;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:700px;margin:8px 0}.main small{color:#61758e;font-size:11px}.actions{display:flex;gap:8px;align-items:center}.actions button,.actions a{padding:9px 12px;border:1px solid #29415e;border-radius:10px;background:#122941;color:#dce8f5;text-decoration:none;font-size:12px;cursor:pointer}.actions .delete{color:#ff9faf;background:#281722;border-color:#4a2732}.empty{padding:50px;text-align:center;border:1px solid #203650;border-radius:18px;color:#8093aa}.empty a{color:#6ee2ff;text-decoration:none}
          @media(max-width:700px){.header{height:auto;padding:18px 0;gap:15px;flex-direction:column;align-items:stretch}nav{width:100%}nav a{flex:1;text-align:center}.row{flex-direction:column}.actions{width:100%;flex-wrap:wrap}.actions button,.actions a{flex:1;text-align:center}.dest{max-width:100%}.title h1{font-size:38px}.title b{position:static;display:inline-block;margin-top:18px}}
        `}</style>
      </div>
    </main>
  );
}

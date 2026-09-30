"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [created, setCreated] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreated("");
    setLoading(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alias }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not create the short link.");
        return;
      }

      setCreated(data.shortUrl);
      setUrl("");
      setAlias("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="page">
    <section className="hero container">
      <div className="nav">
        <div className="brand"><span className="logo">L</span><span>Linkivo</span></div>
        <span className="badge">Personal URL Shortener</span>
      </div>

      <div className="hero-grid">
        <div>
          <p className="eyebrow">FAST · PRIVATE · SIMPLE</p>
          <h1>Your links.<br/><span>Shorter.</span> Smarter.</h1>
          <p className="lead">Create clean short links and manage your personal links from one premium dashboard.</p>
          <div className="stats">
            <div><strong>01</strong><small>Personal workspace</small></div>
            <div><strong>∞</strong><small>Links ready to grow</small></div>
            <div><strong>24/7</strong><small>Redirect availability</small></div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div><h2>Create short link</h2><p>Paste your destination URL below.</p></div>
            <span className="dot"></span>
          </div>

          <form onSubmit={createLink}>
            <label>Destination URL
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/your-long-url" required />
            </label>

            <label>Custom alias <em>optional</em>
              <div className="alias"><span>linkivo-nu.vercel.app/</span><input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="my-link" /></div>
            </label>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Link"} <span>↗</span>
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {created && <div className="result">
            <small>Short link created</small>
            <div><strong>{created}</strong><button type="button" onClick={()=>navigator.clipboard?.writeText(created)}>Copy</button></div>
            <a className="analytics" href={`/analytics/${created.split("/").pop()}`}>View Analytics →</a>
          </div>}
        </div>
      </div>
    </section>

    <section className="features container">
      <div><span>01</span><h3>Simple dashboard</h3><p>Keep every personal short link in one place.</p></div>
      <div><span>02</span><h3>Real analytics</h3><p>Track clicks, devices, countries, browsers and timing.</p></div>
      <div><span>03</span><h3>Fast redirects</h3><p>Each short URL resolves through Linkivo and records the click.</p></div>
    </section>

    <style jsx>{`
      .page{min-height:100vh;background:radial-gradient(circle at 80% 10%,rgba(80,112,255,.18),transparent 32%),radial-gradient(circle at 10% 30%,rgba(0,219,255,.09),transparent 25%),#07111f}
      .hero{padding:28px 0 70px}.nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:80px}
      .brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800}.logo{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#7c5cff,#1fd6ff);box-shadow:0 10px 30px rgba(76,108,255,.25)}
      .badge{padding:8px 12px;border:1px solid rgba(255,255,255,.12);border-radius:999px;color:#aebdd2;font-size:12px}
      .hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}.eyebrow{letter-spacing:.18em;color:#75cfff;font-size:11px;font-weight:700}
      h1{font-size:clamp(48px,7vw,82px);line-height:.98;margin:18px 0}.lead{max-width:600px;color:#9fb0c7;font-size:18px;line-height:1.7}.hero h1 span{background:linear-gradient(90deg,#8e6cff,#39d9ff);-webkit-background-clip:text;background-clip:text;color:transparent}
      .stats{display:flex;gap:34px;margin-top:42px}.stats div{display:flex;flex-direction:column;gap:4px}.stats strong{font-size:22px}.stats small{color:#74879f}
      .card{background:rgba(10,24,43,.82);border:1px solid rgba(255,255,255,.11);border-radius:28px;padding:30px;box-shadow:0 30px 90px rgba(0,0,0,.25);backdrop-filter:blur(16px)}
      .card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.card h2{margin:0;font-size:22px}.card p{margin:7px 0 0;color:#879ab2;font-size:13px}.dot{width:10px;height:10px;border-radius:50%;background:#39d9ff;box-shadow:0 0 20px #39d9ff}
      label{display:block;color:#dbe6f2;font-size:13px;margin:16px 0}.card em{color:#6f8199;font-style:normal;float:right}
      input{width:100%;margin-top:8px;padding:15px 16px;border:1px solid #233957;background:#091728;color:#fff;border-radius:13px;outline:none}.alias{display:flex;align-items:center;margin-top:8px;background:#091728;border:1px solid #233957;border-radius:13px;overflow:hidden}.alias span{padding-left:14px;color:#6f829c;font-size:13px;white-space:nowrap}.alias input{margin:0;border:0}
      .primary{width:100%;margin-top:14px;padding:15px 18px;border:0;border-radius:13px;color:#fff;font-weight:800;background:linear-gradient(90deg,#7658ff,#18cfff);cursor:pointer}.primary span{float:right}.primary:disabled{opacity:.65;cursor:wait}
      .error{margin-top:16px;padding:12px 14px;border-radius:12px;background:#3a1821;border:1px solid #703043;color:#ffb5c2;font-size:13px}
      .result{margin-top:18px;padding:14px;border-radius:14px;background:#0c2237;border:1px solid rgba(57,217,255,.2)}.result small{color:#7f95ad}.result div{display:flex;gap:10px;align-items:center;margin-top:7px}.result strong{font-size:13px;word-break:break-all;flex:1}.result button{border:0;background:#1a3550;color:#fff;padding:8px 11px;border-radius:9px;cursor:pointer}.analytics{display:inline-block;margin-top:12px;color:#6ee2ff;font-size:12px}
      .features{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:70px}.features>div{padding:24px;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:rgba(255,255,255,.025)}.features span{color:#5edcff;font-size:12px}.features h3{margin:12px 0 7px}.features p{color:#8194ab;line-height:1.6;font-size:14px}
      @media(max-width:820px){.hero-grid,.features{grid-template-columns:1fr}.nav{margin-bottom:55px}.stats{gap:18px;flex-wrap:wrap}}
    `}
    </style>
  </main>;
}
